const express = require("express");
const { isLoggedIn } = require("../middleware/isLoggedIn");
const router = express.Router();
const {
  register,
  login,
  adminAccess,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserProfile,
} = require("../controllers/authController");

const { changePassword } = require("../controllers/changePassWord");

function middleware(req, res, next) {
  if (req.headers?.authorization?.split(" ")[1]) {
    next();
  } else {
    res.status(401).send("Please log in again");
  }
}

// NEW ADMIN/USER CONTROLS
router.get('/adminPage', [middleware, isLoggedIn, adminAccess]);

router.get('/user/:userId', [middleware, isLoggedIn])

router.post("/login", login);
router.post("/register", register);
// router.get("/me", middleware, getMe);
router.get("/getAllUsers", isLoggedIn, getAllUsers);
router.get("/getUser/:userId", isLoggedIn, getUserById);
router.patch("/user/:userId", isLoggedIn, changePassword);
router.delete("/deleteUser/:userId", isLoggedIn, deleteUserById);
router.put("/updateUserProfile/:userId", isLoggedIn, updateUserProfile);

module.exports = router;
