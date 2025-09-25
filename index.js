import app from "./app.js";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
// So render stop sending those 404s
app.get("/", (req, res) => res.send("Server healthy"));
