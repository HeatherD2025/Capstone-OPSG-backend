import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
import { changePassword } from "../controllers/changePassWord.js";
import {
  getUserById,
  updateUserProfile,
} from "../controllers/authController.js";

const router = express.Router();

// Authenticated user actions
router.get("/:userId", isLoggedIn, getUserById);
router.put("/:userId", isLoggedIn, updateUserProfile);
router.patch("/:userId/password", isLoggedIn, changePassword);

export default router;
