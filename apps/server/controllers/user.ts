import type { Response, Request } from "express";
import { SignupSchema, SigninSchema } from "../../../packages/exports";
import bcrypt from "bcrypt";
import prisma from "../../../packages/db";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "123";

export const signup = async (req: Request, res: Response) => {
  const response = SignupSchema.safeParse(req.body);
  if (!response.success) {
    return res
      .status(400)
      .json({ message: "Zod validation failed.Enter the correct credentials" });
  }
  const user = response.data;
  const existingUser = await prisma.user.findUnique({
    where: { email: user?.email },
  });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "User with this email is already registered" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashed_password = await bcrypt.hash(user?.password, salt);
  const newUser = await prisma.user.create({
    data: { email: user?.email, password: hashed_password },
  });
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
    expiresIn: "1hr",
  });
  res.cookie("access_token", token, { httpOnly: true });
  return res.json({ id: newUser.id, email: newUser.email });
};

export const signin = async (req: Request, res: Response) => {
  const response = SigninSchema.safeParse(req.body);
  if (!response.success) {
    return res
      .status(400)
      .json({ message: "Zod validation failed.Enter the correct credentials" });
  }
  const user = response.data;
  const existingUser = await prisma.user.findUnique({
    where: { email: user?.email },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });
  if (!existingUser) {
    return res
      .status(409)
      .json({ message: "No user has been registered with this email" });
  }
  const password_check = await bcrypt.compare(
    user.password,
    existingUser.password,
  );
  if (!password_check) {
    return res.status(400).json({
      message: "Your password does not match with the account's password",
    });
  }
  const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET, {
    expiresIn: "1hr",
  });
  res.cookie("access_token", token, { httpOnly: true });
  return res.json({ id: existingUser.id, token, email: existingUser.email });
};
