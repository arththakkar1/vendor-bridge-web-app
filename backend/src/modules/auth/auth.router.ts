import { Router } from "express";
import {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
  getMe,
} from "./auth.controller.js";
import { authenticateUser } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateUser, getMe);

export default router;
