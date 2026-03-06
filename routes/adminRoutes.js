import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import adminAccess from "../middleware/adminAccess.js";
import {
  getUsers,
  getUserById,
  deleteUserById,
} from "../controllers/adminController.js";
import changePassword from "../controllers/changePassword.js";

const router = express.Router();

router.get("/dashboard", isLoggedIn, adminAccess, (req, res) => {
  res.status(200).json({ message: "Welcome, admin" });
});

router.get("/users", isLoggedIn, adminAccess, getUsers);
router.get("/users/:userId", isLoggedIn, adminAccess, getUserById);
router.patch("/users/:userId/password", isLoggedIn, adminAccess, changePassword); // future use - enable pass reset and user delete only
router.delete("/users/:userId", isLoggedIn, adminAccess, deleteUserById);

export default router;
