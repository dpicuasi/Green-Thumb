import { z } from 'zod';
import { 
  insertPlantSchema, 
  insertCareLogSchema, 
  insertReminderSchema,
  plants,
  careLogs,
  reminders,
  subscriptions
} from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  plants: {
    list: {
      method: 'GET' as const,
      path: '/api/plants',
      responses: {
        200: z.array(z.custom<typeof plants.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/plants/:id',
      responses: {
        200: z.custom<typeof plants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/plants',
      input: insertPlantSchema,
      responses: {
        201: z.custom<typeof plants.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/plants/:id',
      input: insertPlantSchema.partial().extend({
        lastWatered: z.string().optional(), // Allow passing date strings
      }),
      responses: {
        200: z.custom<typeof plants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/plants/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  careLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/plants/:plantId/logs',
      responses: {
        200: z.array(z.custom<typeof careLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/plants/:plantId/logs',
      input: insertCareLogSchema.omit({ plantId: true }).extend({
        date: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof careLogs.$inferSelect>(),
      },
    },
  },
  reminders: {
    list: {
      method: 'GET' as const,
      path: '/api/reminders',
      responses: {
        200: z.array(z.custom<typeof reminders.$inferSelect>()),
      },
    },
    toggle: {
      method: 'PATCH' as const,
      path: '/api/reminders/:id/toggle',
      responses: {
        200: z.custom<typeof reminders.$inferSelect>(),
      },
    },
  },
  subscription: {
    get: {
      method: 'GET' as const,
      path: '/api/subscription',
      responses: {
        200: z.custom<typeof subscriptions.$inferSelect>(),
      },
    },
    upgrade: {
      method: 'POST' as const,
      path: '/api/subscription/upgrade',
      responses: {
        200: z.custom<typeof subscriptions.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
