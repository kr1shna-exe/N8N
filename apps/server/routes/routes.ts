import express from "express";
import {
  deleteCredentials,
  getCredentials,
  postCredentials,
  updateCredentials,
} from "../controllers/credentials";
import { signin, signout, signup, verify } from "../controllers/user";
import { executeWorkflow } from "../controllers/workflow";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

router.post("/user/signup", signup);
router.post("/user/signin", signin);
router.post("/user/signout", signout);
router.get("/user/verify", authenticateUser, verify);

router.post("/user/credentials", authenticateUser, postCredentials);
router.get("/user/credentials", authenticateUser, getCredentials);
router.put(
  "/user/credentials/:credentialId",
  authenticateUser,
  updateCredentials
);
router.post("/user/delete/:credentialId", authenticateUser, deleteCredentials);

router.post("/workflow/execute/:workflowId", executeWorkflow);

export default router;
