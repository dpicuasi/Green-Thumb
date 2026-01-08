import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Setup AI Integrations
  registerChatRoutes(app);
  registerImageRoutes(app);

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadDir));

  app.post("/api/upload", isAuthenticated, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // === PROTECTED ROUTES ===
  // All routes below require authentication

  // Plants
  app.get(api.plants.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const plants = await storage.getPlants(userId);
    res.json(plants);
  });

  app.get(api.plants.get.path, isAuthenticated, async (req, res) => {
    const plant = await storage.getPlant(Number(req.params.id));
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    res.json(plant);
  });

  app.post(api.plants.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.plants.create.input.parse(req.body);
      const plant = await storage.createPlant(userId, input);
      res.status(201).json(plant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.plants.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.plants.update.input.parse(req.body);
      const plant = await storage.updatePlant(Number(req.params.id), userId, input);
      res.json(plant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.plants.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deletePlant(Number(req.params.id), userId);
    res.status(204).send();
  });

  // Care Logs
  app.get(api.careLogs.list.path, isAuthenticated, async (req, res) => {
    const logs = await storage.getCareLogs(Number(req.params.plantId));
    res.json(logs);
  });

  app.post(api.careLogs.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.careLogs.create.input.parse(req.body);
      const log = await storage.createCareLog(Number(req.params.plantId), input);
      
      // If log type is 'water', we might need to update plant's lastWatered
      if (input.type === 'water') {
        const userId = req.user.claims.sub;
        await storage.updatePlant(Number(req.params.plantId), userId, {
          lastWatered: new Date().toISOString()
        });
      }

      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Reminders
  app.get(api.reminders.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const reminders = await storage.getReminders(userId);
    res.json(reminders);
  });

  app.patch(api.reminders.toggle.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const reminder = await storage.toggleReminder(Number(req.params.id), userId);
    res.json(reminder);
  });

  // Subscriptions
  app.get(api.subscription.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const sub = await storage.getSubscription(userId);
    res.json(sub || { tier: 'free', isActive: true });
  });

  app.post(api.subscription.upgrade.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    // Mock upgrade: toggle between free and premium
    const current = await storage.getSubscription(userId);
    const isPremium = current?.tier !== 'premium';
    const sub = await storage.createOrUpdateSubscription(userId, isPremium);
    res.json(sub);
  });

  return httpServer;
}

// Seed function not needed for per-user data structure in this case, 
// as data depends on authenticated user.
