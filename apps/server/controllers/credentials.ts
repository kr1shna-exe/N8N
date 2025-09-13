import {
  credentialsSchema,
  credentialsUpdateSchema,
} from "../../../packages/exports";
import { Request, Response } from "express";
import prisma from "../../../packages/db";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const postCredentials = async (req: AuthRequest, res: Response) => {
  const response = credentialsSchema.safeParse(req.body);
  if (!response.success) {
    return res
      .status(400)
      .json({ message: "Zod validation failed.Enter the correct credentials" });
  }
  const data = response.data;
  const newCredentials = await prisma.credentials.create({
    data: {
      title: data.title,
      platform: data.platform,
      data: data.data,
      userId: req.user?.id,
    },
  });
  return res.json({
    message: "You have succesfully stored your credentials",
    newCredentials,
  });
};

export const getCredentials = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const credentials = await prisma.credentials.findMany({
    where: {
      userId,
    },
  });
  return res.json({ message: "Here are all your credentials", credentials });
};

export const deleteCredentials = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { credentialId } = req.params;
  const deleteCredentials = await prisma.credentials.delete({
    where: {
      userId,
      id: credentialId,
    },
  });
  return res.json({
    message: "Credentials were succesfully deleted",
    deleteCredentials,
  });
};

export const updateCredentials = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { credentialId } = req.params;
  const response = credentialsUpdateSchema.safeParse(req.body);
  if (!response.success) {
    return res.json({
      message:
        "No changes were made for existing data.Try to change it and then update the credentials",
    });
  }
  const updatedCreds = response.data;
  const updateCredentials = await prisma.credentials.update({
    where: {
      userId,
      id: credentialId,
    },
    data: {
      title: updatedCreds.title,
      platform: updatedCreds.platform,
      data: updatedCreds.data,
    },
  });
  return res.json({
    message: "You have updated your credentials",
    updateCredentials,
  });
};
