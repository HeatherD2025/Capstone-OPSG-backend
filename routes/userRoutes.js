import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import changePassword from "../controllers/changePassword.js";
import {
  getUserById,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Authenticated user actions
router.get("/getUser/:userId", isLoggedIn, getUserById);
router.put("/updateUserProfile/:userId", isLoggedIn, updateUserProfile);
router.patch("/user/:userId", isLoggedIn, changePassword);

export default router;
