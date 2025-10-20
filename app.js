import express from "express";
import cors from "cors";
import morgan from "morgan";

import adminRoutes from "./routes/authRoutes.js";
import qbAuthRoutes from "./services/qbAuthRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  // once deployed, add frontend here 
]

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  // set to allow multiple origins
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, //ensures uth headers/cookies sent
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

// app.options("/.*/", cors());

app.use(morgan("dev"));

// Backend routes
app.use("/auth", adminRoutes);
app.use("/qbauth", qbAuthRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res
    .status(error.status || 500)
    .send(error.message || "Internal server error.");
});

// Default to 404 if no other route matched
app.use((req, res) => {
  res.status(404).send("Not found.");
});

export default app;
