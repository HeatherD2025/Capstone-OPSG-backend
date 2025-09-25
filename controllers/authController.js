import prisma from '../common/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const { isLoggedIn } = require("../middleware/isLoggedIn.js");

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.log("User not found"); // Log if user is not found
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log("isPasswordValid", isPasswordValid); // Log the password validation result

    if (!isPasswordValid) {
      console.log("Invalid password"); // Log if password is invalid
      return res.status(401).json({
        statusCode: 401,
        message: "Login denied",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.WEB_TOKEN
    );
    console.log("Token created successfully");

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Server error",
    });
  }
};

export const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const registerUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    },
  });

  const token = jwt.sign(
    { id: registerUser.id, email, isAdmin: registerUser.isAdmin },
    process.env.WEB_TOKEN,
    { expiresIn: "24h" }
  );

  const { password: _, ...userWithoutPassword } = registerUser;

  res.json({ user: userWithoutPassword, token });
};

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await prisma.user.findMany();
    if (allUsers.length > 0) {
      res.send(allUsers);
    } else {
      !user;
      return res.status(404).json({
        statusCode: 404,
        message: "No users found.",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res) => {
  const userId = req.params.userId;
  try {
    const getUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!getUser) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found. Check userId",
      });
    }
    res.status(200).json(getUser);
  } catch (error) {
    console.error(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const deleteUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    res.status(204).json(deleteUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "An error occurred while deleting the user",
    });
    next();
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: "User Id is required",
      });
    }
    const { firstName, lastName, email } = req.body;
    if (!firstName && !lastName && !email) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "At least one of firstName, lastName, or email must be provided",
      });
      next();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    return res.status(200).json({
      statusCode: 200,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};
