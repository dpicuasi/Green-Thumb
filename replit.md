# Geranium Journal

## Overview

Geranium Journal is a plant care tracking application that helps users manage their personal plant collection. Users can add plants, log care activities (watering, fertilizing, pruning), set reminders, and get AI-powered plant care advice. The app features a premium subscription tier for advanced features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: i18next for multi-language support (English, Spanish)
- **Build Tool**: Vite with HMR support

The frontend follows a pages-based structure with shared components. Custom hooks abstract API calls and provide clean interfaces for data fetching and mutations.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints defined in shared route schemas
- **Validation**: Zod schemas shared between client and server

The backend uses a storage abstraction layer (`IStorage` interface) that wraps database operations, making it easier to test and modify data access patterns.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Schema Location**: `shared/schema.ts` contains all table definitions

Key tables: `users`, `sessions`, `plants`, `careLogs`, `reminders`, `subscriptions`, `conversations`, `messages`

### Authentication
- **Method**: Replit Auth (OpenID Connect)
- **Session**: Express-session with PostgreSQL store
- **Middleware**: `isAuthenticated` middleware protects API routes
- **User Storage**: Users table synced from Replit Auth claims

### AI Integrations
- **Chat**: OpenAI-compatible API for plant care advice
- **Image Generation**: GPT-image-1 model for plant-related images
- **Batch Processing**: Utility module with rate limiting and retries for bulk AI operations

## External Dependencies

### Third-Party Services
- **Replit Auth**: OpenID Connect authentication provider
- **OpenAI API**: AI chat and image generation (via Replit AI Integrations)

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit)
- `AI_INTEGRATIONS_OPENAI_API_KEY`: API key for AI features
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: Base URL for AI API

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express-session` / `connect-pg-simple`: Session management
- `openid-client` / `passport`: Authentication
- `@tanstack/react-query`: Data fetching
- `shadcn/ui` components: UI component library (Radix-based)
- `openai`: AI API client