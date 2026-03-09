import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import {
  getCurrentUser,
  updateUserProfile,
} from "../controllers/userController.js";
import changePassword from "../controllers/changePassword.js";

const router = express.Router();

router.get("/dashboard", isLoggedIn, (req, res) => {
  res.status(200).json({ message: "Welcome!" });
});
router.get("/me", isLoggedIn, getCurrentUser);
router.patch("/me", isLoggedIn, updateUserProfile);
router.patch("/me/password", isLoggedIn, changePassword);

export default router;
