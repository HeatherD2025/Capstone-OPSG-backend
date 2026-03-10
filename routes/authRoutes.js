import express from "express";
import { refreshTokenHandler } from "../controllers/authController.js";
import { register, login, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout)
router.post("/register", register);
router.post("/refresh", refreshTokenHandler);

export default router;
