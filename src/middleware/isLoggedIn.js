import jwt from 'jsonwebtoken';
import 'dotenv/config';

export async function isLoggedIn(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", ""); // Extract the token

    if (!token) {
      return res
        .status(401)
        .json({ error: "You must be logged in to access this resource." });
    }

    const user = jwt.verify(token, process.env.WEB_TOKEN); // Verify the token using the secret key
    req.user = user; // Attach the user information to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token:", error); // Log the error for debugging
    return res.status(401).json({ error: "Invalid token." }); // Respond with an error if the token is invalid
  }
}

