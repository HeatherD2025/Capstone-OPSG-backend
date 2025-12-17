import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import {
  getCurrentUser,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", isLoggedIn, getCurrentUser);
router.put("/me/updateUserProfile", isLoggedIn, updateUserProfile);

export default router;
