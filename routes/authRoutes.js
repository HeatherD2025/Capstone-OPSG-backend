import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import adminAccess from '../middleware/adminAccess.js';
import { changePassword } from '../controllers/changePassWord.js';
import {
  register,
  login,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserProfile,
} from "../controllers/authController.js";

const router = express.Router();

// NEW ADMIN/USER CONTROLS
router.get('/adminPage', [isLoggedIn, adminAccess, (req, res) => {
  res.status(200).json({ message: "Welcome admin" });
}]);
router.get("/getAllUsers", isLoggedIn, adminAccess, getAllUsers);

router.get('/user/:userId', [isLoggedIn])
router.patch("/user/:userId", isLoggedIn, changePassword);

router.post("/login", login);
router.post("/register", register);

router.get("/getUser/:userId", isLoggedIn, getUserById);
router.delete("/deleteUser/:userId", isLoggedIn, deleteUserById);
router.put("/updateUserProfile/:userId", isLoggedIn, updateUserProfile);

export default router;
