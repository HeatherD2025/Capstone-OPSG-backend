import express from "express";
import { refreshTokenHandler } from "../controllers/authController.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshTokenHandler);

export default router;
