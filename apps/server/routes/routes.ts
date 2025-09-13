import express from "express";
import {
  deleteCredentials,
  getCredentials,
  postCredentials,
  updateCredentials,
} from "../controllers/credentials";
import { signin, signup } from "../controllers/user";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

router.post("/user/signup", signup);
router.post("/user/signin", signin);

router.post("/user/credentials", authenticateUser, postCredentials);
router.get("/user/credentials", authenticateUser, getCredentials);
router.put(
  "/user/credentials/:credentialId",
  authenticateUser,
  updateCredentials
);
router.post("/user/delete/:credentialId", authenticateUser, deleteCredentials);

export default router;
