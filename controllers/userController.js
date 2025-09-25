import prisma from '../common/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { isLoggedIn } from '../middleware/isLoggedIn.js';

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
