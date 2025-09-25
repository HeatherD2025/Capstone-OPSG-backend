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

function middleware(req, res, next) {
  if (req.headers?.authorization?.split(" ")[1]) {
    next();
  } else {
    res.status(401).send("Please log in again");
  }
}

// NEW ADMIN/USER CONTROLS
router.get('/adminPage', [middleware, isLoggedIn, adminAccess]);
router.get("/getAllUsers", isLoggedIn, adminAccess, getAllUsers);

router.get('/user/:userId', [middleware, isLoggedIn])

router.post("/login", login);
router.post("/register", register);
// router.get("/me", middleware, getMe);

router.get("/getUser/:userId", isLoggedIn, getUserById);
router.patch("/user/:userId", isLoggedIn, changePassword);
router.delete("/deleteUser/:userId", isLoggedIn, deleteUserById);
router.put("/updateUserProfile/:userId", isLoggedIn, updateUserProfile);

export default router;
