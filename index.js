import app from "./app.js";
import "dotenv/config";
import cron from "node-cron";
import { exec } from "child_process";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

// Run every night at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running midnight token cleanup...");
  exec("node prisma/cleanup.js", (error, stdout, stderr) => {
    if (error) console.error(`Error: ${error.message}`);
    if (stderr) console.error(`Stderr: ${stderr}`);
    console.log(`Stdout: ${stdout}`);
  });
});

