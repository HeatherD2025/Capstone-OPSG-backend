import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
import adminAccess from "../middleware/adminAccess.js";
import { changePassword } from "../controllers/changePassword.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

export default router;
