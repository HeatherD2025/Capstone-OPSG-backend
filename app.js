import express from "express";
import cors from "cors";
import morgan from "morgan";

import adminRoutes from "./routes/adminRoutes.js";
import qbAuthRoutes from "./services/qbAuthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  // once deployed, add frontend here
];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    // set to allow multiple origins
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, //ensures uth headers/cookies sent
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    preflightContinue: false, // this ensures Express can handle 'OPTIONS'
  })
);

app.use(morgan("dev"));

// Backend routes
app.use("/admin", adminRoutes);
app.use("/qbauth", qbAuthRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// root route to check server health
app.get("/", (req, res) => res.send("Server healthy"));

// Error handling middleware - Lets axiosBaseQuery to handle structured responses
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(error.status || 500).json({
    error: true,
    message: error.message || "Internal server error",
  });
});

// Default to 404 if no other route matched
app.use((req, res) => {
  res.status(404).send("Not found.");
});

export default app;
