import * as z from "zod";
import { Platform } from "../../db/types";

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
    chatId: z.string().min(1, "Chat Id is required").optional(),
  }),
});

const geminiSchema = z.object({
  title: z.string().min(2, "Platform title must have atleast 2 characters"),
  platform: z.literal(Platform.Gemini),
  data: z.object({
    apiKey: z.string().min(1, "API Key is required"),
  }),
});

const groqSchema = z.object({
  title: z.string().min(2, "Platform title must have atleast 2 characters"),
  platform: z.literal(Platform.Groq),
  data: z.object({
    apiKey: z.string().min(1, "API Key is required"),
  }),
});

export const credentialsSchema = z.discriminatedUnion("platform", [
  resendSchema,
  telegramSchema,
  geminiSchema,
  groqSchema,
]);

export const credentialsUpdateSchema = z.discriminatedUnion("platform", [
  resendSchema.partial(),
  telegramSchema.partial(),
  geminiSchema.partial(),
  groqSchema.partial(),
]);

export type credentialsSchema = z.infer<typeof credentialsSchema>;
export type updatedCredentialSchema = z.infer<typeof credentialsUpdateSchema>;
