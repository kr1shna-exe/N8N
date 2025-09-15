import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../../packages/db";
import { SigninSchema, SignupSchema } from "../../../packages/exports";
import { AuthRequest } from "./credentials";

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
  res.cookie("access_token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
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
  res.cookie("access_token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
  return res.json({ id: existingUser.id, token, email: existingUser.email });
};

export const verify = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    res.status(200).json({
      success: true,
      message: "Token valid",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const signout = async (req: Request, res: Response) => {
  try {
    // Clear the HTTP-only cookie
    res.clearCookie("access_token");

    res.status(200).json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
