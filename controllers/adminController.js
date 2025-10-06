import { Prisma } from '@prisma/client';
import prisma from '../common/client.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
        select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true, 
            isAdmin: true}
    });

    if (users.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "No users found.",
        data: []
      });
    }

    res.status(200).json({
        statusCode: 200,
        message: "Users suessfully retrieved",
        data: users
    })
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
        statusCode: 400,
        message: "User ID is required",
    });
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
        statusCode: 200,
        message: "User successfully deleted",
        data: { userId }
    });

  } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }
    next(error);
  }
};