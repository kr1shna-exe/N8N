import express from "express";
import { signin, signup } from "../controllers/user";
import {
  deleteCredentials,
  getCredentials,
  postCredentials,
  updateCredentials,
} from "../controllers/credentials";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

router.post("/user/signup", signup);
router.post("/user/signin", signin);

router.post("/user/credentials", authenticateUser, postCredentials);
router.get("/user/credentials", authenticateUser, getCredentials);
router.put("/user/credentials", authenticateUser, updateCredentials);
router.post("/user/delete", authenticateUser, deleteCredentials);

export default router;
