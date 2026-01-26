import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

const getReplitOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

const getGoogleOidcIssuer = memoize(async () => {
  return await client.Issuer.discover('https://accounts.google.com');
}, { maxAge: 3600 * 1000 });


export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any, provider: 'replit' | 'google') {
  const userData =
    provider === 'google'
      ? {
          id: claims.sub,
          email: claims.email,
          firstName: claims.given_name,
          lastName: claims.family_name,
          profileImageUrl: claims.picture,
        }
      : {
          id: claims.sub,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
        };

  await authStorage.upsertUser(userData);
}

const makeVerify = (provider: 'replit' | 'google'): VerifyFunction => async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims(), provider);
    verified(null, user);
  };

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const replitConfig = await getReplitOidcConfig();
  const googleIssuer = await getGoogleOidcIssuer();
  
  const verifyReplit = makeVerify('replit');
  const verifyGoogle = makeVerify('google');

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string, provider: 'replit' | 'google') => {
    const strategyName = `auth:${provider}:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      let strategy;
      if (provider === 'google') {
        const googleClient = new googleIssuer.Client({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        });
        strategy = new Strategy(
          {
            name: strategyName,
            client: googleClient,
            params: {
              scope: "openid email profile",
            },
            callbackURL: `https://${domain}/api/callback?provider=google`,
          },
          verifyGoogle
        );
      } else { // replit
        strategy = new Strategy(
          {
            name: strategyName,
            config: replitConfig,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback?provider=replit`,
          },
          verifyReplit
        );
      }
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const provider = (req.query.provider || 'replit') as ('replit' | 'google');
    ensureStrategy(req.hostname, provider);

    const strategyName = `auth:${provider}:${req.hostname}`;
    
    let authOptions: passport.AuthenticateOptions = {};

    if (provider === 'replit') {
      authOptions = {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      }
    } else {
      authOptions = {
        scope: ["openid", "email", "profile"],
      }
    }

    passport.authenticate(strategyName, authOptions)(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const provider = (req.query.provider || 'replit') as ('replit' | 'google');
    ensureStrategy(req.hostname, provider);

    const strategyName = `auth:${provider}:${req.hostname}`;

    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    const user = req.user as any;
    const provider = user?.claims?.iss?.includes('google') ? 'google' : 'replit';
    
    req.logout(async () => {
      if (provider === 'replit') {
        const config = await getReplitOidcConfig();
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      } else {
        res.redirect(`${req.protocol}://${req.hostname}`);
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    // Cannot refresh google token this way without more setup
    // so we just unauthorized them
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getReplitOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
