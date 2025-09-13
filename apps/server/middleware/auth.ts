import jwt from "jsonwebtoken";
import prisma from "../../../packages/db";
import { JWT_SECRET } from "../controllers/user";

export const authenticateUser = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization as string | undefined;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  const token = bearerToken ?? req.cookies?.access_token;
  if (!token) {
    return res.json({ message: "Not valid token" });
  }

  const decode = jwt.verify(token, JWT_SECRET) as {
    userId: string;
  };
  const user = await prisma.user.findUnique({
    where: { id: decode.userId },
  });
  if (!user) {
    return res.json({ message: "User not found" });
  }
  req.user = user;
  next();
};
