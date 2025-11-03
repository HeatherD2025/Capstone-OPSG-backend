// import express from "express";
// import isLoggedIn from "../middleware/isLoggedIn.js";
// import changePassword from "../controllers/changePassword.js";
// import {
//   getUserById,
//   updateUserProfile,
// } from "../controllers/userController.js";

// const router = express.Router();

// // Authenticated user actions
// router.get("/:userId", isLoggedIn, getUserById);
// router.put(":userId", isLoggedIn, updateUserProfile);
// router.patch(":userId/password", isLoggedIn, changePassword);

// export default router;


//TEST CODE 
import express from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import changePassword from "../controllers/changePassword.js";
import {
  getUserById,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Authenticated user routes (current user)
router.get("/me", isLoggedIn, getUserById);
router.put("/me", isLoggedIn, updateUserProfile);
router.patch("/me/password", isLoggedIn, changePassword);

// Admin or external use: access any user by ID
router.get("/:userId", isLoggedIn, getUserById);
router.put("/:userId", isLoggedIn, updateUserProfile);
router.patch("/:userId/password", isLoggedIn, changePassword);

export default router;
