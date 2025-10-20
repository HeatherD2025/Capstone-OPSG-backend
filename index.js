import app from "./app.js";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
// root route to check server health
app.get("/", (req, res) => res.send("Server healthy"));
