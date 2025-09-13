import * as z from "zod";
import { Platform } from "../../db";

const nodeSchema = z.object({
  title: z.string().min(2, "Title must be atleast 2 characters long"),
  type: z.enum([Platform.Telegram, Platform.ResendEmail]),
  credentials: z.string().optional(),
});

const webhookSchema = z.object({
  title: z.string(),
  secret: z.string().optional(),
});

export const workflowSchema = z
  .object({
    title: z.string().min(2, "Title must be atleast 2 characters long"),
    enabled: z.boolean().optional(),
    nodes: z.record(z.string(), nodeSchema),
    connections: z.record(z.string(), z.array(z.string())),
    triggerType: z.enum(["Manual", "Webhook"]),
    webhook: webhookSchema.optional(),
  })
  .partial();
