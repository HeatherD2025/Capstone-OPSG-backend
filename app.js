import express from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";

import authRoutes from './routes/authRoutes.js'
import qbAuthRoutes from "./services/quickbooks/qbAuthRoutes.js";
import { isLoggedIn } from "./middleware/isLoggedIn.js";
import adminAccess from "./middleware/adminAccess.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

console.log("Routes loaded");

// Backend routes
app.use("/auth", authRoutes);
app.use("/qbauth", qbAuthRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(error.status || 500).send(error.message || "Internal server error.");
});

// Default to 404 if no other route matched
app.use((req, res) => {
  res.status(404).send("Not found.");
});

export default app;
