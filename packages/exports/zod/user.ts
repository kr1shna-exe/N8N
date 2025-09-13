import * as z from "zod";

export const SignupSchema = z.object({
  email: z.string().email("Invalid Email Address"),
  password: z.string().min(4, "Password must be atleast 4 characters"),
});

export const SigninSchema = z.object({
  email: z.string().email("Invalid Email Address"),
  password: z.string().min(4, "Password must be atleast 4 characters"),
});

export type signUpSchema = z.infer<typeof SignupSchema>;
export type signInSchema = z.infer<typeof SigninSchema>;
