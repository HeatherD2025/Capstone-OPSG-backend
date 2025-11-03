import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import { refreshTokenHandler } from "../controllers/authController.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/auth/refresh", refreshTokenHandler);
// router.post("/auth/refresh", async (req, res) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) return res.status(401).json({ message: "No token" });

//   try {
//     const userData = verifyRefreshToken(refreshToken); // your logic
//     const newAccessToken = generateAccessToken(userData);
//     const newRefreshToken = generateRefreshToken(userData);

//     res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
//   } catch (err) {
//     res.status(403).json({ message: "Invalid refresh token" });
//   }
// });

// // router.get('/user/:userId', isLoggedIn)

// // export default router;

// // TEST CODE
// import express from "express";
// import isLoggedIn from "../middleware/isLoggedIn.js";
// import { register, login } from "../controllers/authController.js";

// const router = express.Router();

// router.post("/login", login);
// router.post("/register", register);

// // REMOVE /user/:userId here: redundant, use /users/:userId instead

// export default router;

//TEST CODE
// import express from "express";
// import {
//   connect,
//   qbToken,
//   account,
//   disconnect,
//   customerBalance,
// } from "../services/qbAuth.js";
// import isLoggedIn from "../middleware/isLoggedIn.js";
// import { refreshQbToken } from "../middleware/quickbooks.js";

// const router = express.Router();

// // OAuth flow
// router.get("/connect", connect);
// router.get("/callback", qbToken);
// router.get("/disconnect", disconnect);

// // Get QuickBooks account info
// // /account or /account/:userId
// router.get("/account", isLoggedIn, refreshQbToken, account);
// router.get("/account/:userId", isLoggedIn, refreshQbToken, account);

// // Get customer balance
// // /customer/:id for current user, /customer/:userId/:id for admin or multi-user
// router.get("/customer/:id", isLoggedIn, refreshQbToken, customerBalance);
// router.get("/customer/:userId/:id", isLoggedIn, refreshQbToken, customerBalance);

export default router;
