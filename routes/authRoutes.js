import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import adminAccess from '../middleware/adminAccess.js';
import { changePassword } from '../controllers/changePassWord.js';
import {
  register,
  login,
} from "../controllers/authController.js";

const router = express.Router();

// NEW ADMIN/USER CONTROLS
// router.get('/adminPage', [isLoggedIn, adminAccess, (req, res) => {
//   res.status(200).json({ message: "Welcome admin" });
// }]);
// router.get("/getAllUsers", isLoggedIn, adminAccess, getAllUsers);

// router.get('/user/:userId', [isLoggedIn])
// router.patch("/user/:userId", isLoggedIn, changePassword);

router.post("/login", login);
router.post("/register", register);

export default router;
