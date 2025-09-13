import { Platform } from "../../db";
import * as z from "zod";

const resendSchema = z.object({
  title: z.string().min(2, "Platform title must have atleast 2 characters"),
  platform: z.literal(Platform.ResendEmail),
  data: z.object({
    apiKey: z.string().min(1, "Api Key is required"),
  }),
});

const telegramSchema = z.object({
  title: z.string().min(2, "Platform title must have atleast 2 characters"),
  platform: z.literal(Platform.Telegram),
  data: z.object({
    apiKey: z.string().min(1, "Api Key is required"),
  }),
});

export const credentialsSchema = z.discriminatedUnion("platform", [
  resendSchema,
  telegramSchema,
]);

export const credentialsUpdateSchema = z.discriminatedUnion("platform", [
  resendSchema.partial(),
  telegramSchema.partial(),
]);

export type credentialsSchema = z.infer<typeof credentialsSchema>;
export type updatedCredentialSchema = z.infer<typeof credentialsUpdateSchema>;
