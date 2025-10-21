import prisma from "../common/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    },
    process.env.WEB_TOKEN || process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m"}
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.WEB_TOKEN || process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d"}
  );
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // find user and select all info for login, password removed on res.
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      statusCode: 200,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: {email} });
    if (existingUser)
      return res.status(400).json({
        statusCode: 400,
        message: "User already exists",
  });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const registerUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const { password: _, ...userWithoutPassword } = registerUser;

    return res.status(201).json({
      statusCode: 201,
      message: "Registration succesful",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Registration error", error);
    next(error);
  }
};
