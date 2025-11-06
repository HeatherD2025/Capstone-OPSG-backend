import { Prisma } from '@prisma/client';
import prisma from '../common/client.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await prisma.user.findMany();

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

export const searchUsers = async (req, res, next) => {
  try {
    const { term } = req.query;
    if (!term) {
      return res.status(400).json({
        statusCode: 400,
        message: "Please provide a search term"
      });
    }

    // find user and select all info for login, password removed on res.
    const users = await prisma.user.findMany({
      where: { 
        OR: [
          { email: { contains: term, mode: "insensitive" } },
          { firstName: { contains: term, mode: "insensitive" } },
          { lastName: { contains: term, mode: "insensitive" } },
          {
            AND: [
              { firstName: { contains: term.split("")[0], mode: "insensitive" } },
              { lastName: { contains: term.split("")[0], mode: "insensitive" } },
            ],
          },
        ],
       },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
      },
    });

    if (!users || users.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "No users found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "User found",
      data: users,
    });
  } catch (error) {
    console.error("Search user error", error);
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