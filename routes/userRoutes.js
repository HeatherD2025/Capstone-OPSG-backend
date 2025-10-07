import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
import { changePassword } from "../controllers/changePassWord.js";
import {
  getUserById,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Authenticated user actions
router.get("/me", isLoggedIn, getUserById);
router.put("/me", isLoggedIn, updateUserProfile);
router.patch("/me/password", isLoggedIn, changePassword);

export default router;
