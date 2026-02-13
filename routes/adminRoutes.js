import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import adminAccess from "../middleware/adminAccess.js";
import {
  getUsers,
  getUserById,
  searchUsers,
  deleteUserById,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", isLoggedIn, adminAccess, (req, res) => {
  res.status(200).json({ message: "Welcome, admin" });
});

router.get("/users", isLoggedIn, adminAccess, getUsers);
// router.get("/search", isLoggedIn, adminAccess, searchUsers);
router.get("/users/:userId", isLoggedIn, adminAccess, getUserById);
router.delete("/users/:userId", isLoggedIn, adminAccess, deleteUserById);

export default router;
