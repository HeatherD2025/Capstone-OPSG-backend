import express from "express";
import {
  connect,
  qbToken,
  account,
  disconnect,
  customerBalance,
} from "./qbAuth.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
import { refreshQbToken } from "../middleware/quickbooks.js";

const router = express.Router();

router.get("/connect", isLoggedIn, connect);
router.get("/callback", qbToken);
router.get("/disconnect", isLoggedIn, disconnect);

router.get("/account", isLoggedIn, refreshQbToken, account);
router.get("/company/:id", isLoggedIn, refreshQbToken, customerBalance);

export default router;
