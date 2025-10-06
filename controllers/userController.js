import { Prisma } from "@prisma/client";
import prisma from '../common/client.js';

export const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: user,
      message: "User successfully retrieved",
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { userId } = req.params;
  const { firstName, lastName, email } = req.body;

  if (!userId) {
    return res.status(400).json({
      statusCode: 400,
      message: "User Id is required",
    });
  }

  if (!firstName && !lastName && !email) {
    return res.status(400).json({
      statusCode: 400,
      message: "At least one of firstName, lastName, or email must be provided",
    });
  }

  const updateData = {};
  if (firstName) updateData.firstName = firstName.trim();
  if (lastName) updateData.lastName = lastName.trim();
  if (email) updateData.email = email.trim().toLowerCase();

  try {
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
      data: { user: updatedUser },
      message: "User profile successfully updated",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      // Prisma record not found error
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }
    next(error);
  }
};
