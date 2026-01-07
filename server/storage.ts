import { db } from "./db";
import { 
  plants, careLogs, reminders, subscriptions,
  type Plant, type InsertPlant, type UpdatePlantRequest,
  type CareLog, type InsertCareLog,
  type Reminder, type InsertReminder,
  type Subscription
} from "@shared/schema";
import { eq, and, desc, lt, gte } from "drizzle-orm";

export interface IStorage {
  // Plants
  getPlants(userId: string): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  createPlant(userId: string, plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, userId: string, update: UpdatePlantRequest): Promise<Plant>;
  deletePlant(id: number, userId: string): Promise<void>;

  // Care Logs
  getCareLogs(plantId: number): Promise<CareLog[]>;
  createCareLog(plantId: number, log: InsertCareLog): Promise<CareLog>;

  // Reminders
  getReminders(userId: string): Promise<Reminder[]>;
  getPendingReminders(userId: string): Promise<Reminder[]>;
  createReminder(userId: string, plantId: number, reminder: InsertReminder): Promise<Reminder>;
  toggleReminder(id: number, userId: string): Promise<Reminder>;

  // Subscription
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createOrUpdateSubscription(userId: string, isPremium: boolean): Promise<Subscription>;
}

export class DatabaseStorage implements IStorage {
  // Plants
  async getPlants(userId: string): Promise<Plant[]> {
    return await db.select()
      .from(plants)
      .where(and(eq(plants.userId, userId), eq(plants.isArchived, false)));
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant;
  }

  async createPlant(userId: string, plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db.insert(plants)
      .values({ ...plant, userId })
      .returning();
    
    // Automatically calculate next watering if frequency is set
    if (newPlant.wateringFrequency) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + newPlant.wateringFrequency);
      
      await db.update(plants)
        .set({ nextWatering: nextDate })
        .where(eq(plants.id, newPlant.id));

      await this.createReminder(userId, newPlant.id, {
        type: 'water',
        dueDate: nextDate,
      });
    }

    return newPlant;
  }

  async updatePlant(id: number, userId: string, update: UpdatePlantRequest): Promise<Plant> {
    const updates: any = { ...update };
    
    // Handle lastWatered update to reschedule next watering
    if (update.lastWatered) {
      const lastWateredDate = new Date(update.lastWatered);
      updates.lastWatered = lastWateredDate;
      
      const plant = await this.getPlant(id);
      if (plant && plant.wateringFrequency) {
        const nextDate = new Date(lastWateredDate);
        nextDate.setDate(nextDate.getDate() + plant.wateringFrequency);
        updates.nextWatering = nextDate;

        // Create a reminder for the next watering
        await this.createReminder(userId, id, {
          type: 'water',
          dueDate: nextDate,
        });
      }
    }

    const [updatedPlant] = await db.update(plants)
      .set(updates)
      .where(and(eq(plants.id, id), eq(plants.userId, userId)))
      .returning();
    return updatedPlant;
  }

  async deletePlant(id: number, userId: string): Promise<void> {
    await db.update(plants)
      .set({ isArchived: true })
      .where(and(eq(plants.id, id), eq(plants.userId, userId)));
  }

  // Care Logs
  async getCareLogs(plantId: number): Promise<CareLog[]> {
    return await db.select()
      .from(careLogs)
      .where(eq(careLogs.plantId, plantId))
      .orderBy(desc(careLogs.date));
  }

  async createCareLog(plantId: number, log: InsertCareLog): Promise<CareLog> {
    const logDate = log.date ? new Date(log.date) : new Date(); // Handle undefined date string
    const [newLog] = await db.insert(careLogs)
      .values({ ...log, plantId, date: logDate })
      .returning();
    return newLog;
  }

  // Reminders
  async getReminders(userId: string): Promise<Reminder[]> {
    return await db.select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(reminders.dueDate);
  }

  async getPendingReminders(userId: string): Promise<Reminder[]> {
    return await db.select()
      .from(reminders)
      .where(and(
        eq(reminders.userId, userId),
        eq(reminders.isCompleted, false),
        lt(reminders.dueDate, new Date())
      ))
      .orderBy(reminders.dueDate);
  }

  async createReminder(userId: string, plantId: number, reminder: InsertReminder): Promise<Reminder> {
    const dueDate = new Date(reminder.dueDate);
    const [newReminder] = await db.insert(reminders)
      .values({ ...reminder, plantId, userId, dueDate })
      .returning();
    return newReminder;
  }

  async toggleReminder(id: number, userId: string): Promise<Reminder> {
    const [reminder] = await db.select().from(reminders).where(eq(reminders.id, id));
    if (!reminder) throw new Error("Reminder not found");

    const [updated] = await db.update(reminders)
      .set({ isCompleted: !reminder.isCompleted })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return updated;
  }

  // Subscription
  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return sub;
  }

  async createOrUpdateSubscription(userId: string, isPremium: boolean): Promise<Subscription> {
    const tier = isPremium ? 'premium' : 'free';
    const [sub] = await db.insert(subscriptions)
      .values({ userId, tier, isActive: true })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { tier, isActive: true, startDate: new Date() }
      })
      .returning();
    return sub;
  }
}

export const storage = new DatabaseStorage();
