import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get('/user/:userId', isLoggedIn)

export default router;
