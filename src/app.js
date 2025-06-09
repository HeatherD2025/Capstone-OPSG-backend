const express = require("express");
const app = express();
const path = require("path");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const morgan = require("morgan");
app.use(morgan("dev"));

// Middleware to serve static files from the client/dist director
const authRoutes = require("./routes/auth");
const qbAuthRoutes = require("./services/quickbooks/qbAuthRoutes");
const { isLoggedIn } = require("./middleware/isLoggedIn");
const { adminAccess } = require("./controllers/authController");
console.log("Routes loaded");

// Backend routes
app.use("/auth", authRoutes);
app.use("/qbauth", qbAuthRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});

// Default to 404 if no other route matched
app.use((req, res) => {
  res.status(404).send("Not found.");
});

module.exports = app;
