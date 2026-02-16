import { Prisma } from '@prisma/client';
import prisma from '../common/client.js';

export const getUsers = async (req, res, next) => {
  try {

    const { term, role, active, createdAfter, page = 1, limit = 20} = req.query

    // bc filters are optional, Prisma query is built dynamically
    let where = {};

    if (term) {
      const words = term.trim().split(/\s+/);

      // OR conditions - any can match
      where.OR = [
        {email: {contains: term, mode: 'insensitive'}},
        {firstName: {contains: term, mode: 'insensitive'}},
        {lastName: {contains: term, mode: 'insensitive'}},

        // ... bc array is returned, match first name OR last for both words
        ...words.map(word => ({
          OR: [
            { firstName: { contains: word, mode: 'insensitive'} },
            { lastName: {contains: word, mode: 'insensitive'} },
          ]
        }))
      ];
    }

    // adds admin role where provided
    if (role) {
      where.role = role;
    }


    if (active !== undefined) {
      where.active = active === "true";
    }

    if (createdAfter) {
      where.createdAt = {
        gte: new Date(createdAfter)
      };
    }

    const allUsers = await prisma.user.findMany({
      where,
      skip: (page -1) * limit,
      take: Number(limit),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          isAdmin: true,
        },
      });

       res.status(200).json({
        statusCode: 200,
        data: allUsers,
        message: "Users retrieved successfully",
      });

  } catch (error) {
    next(error);
  }
};


// export const getAllUsers = async (req, res, next) => {
//   try {
//     const allUsers = await prisma.user.findMany();

//     // fail and success responses
//     if (allUsers.length === 0) {
//       return res.status(200).json({
//         statusCode: 200,
//         message: "OK",
//         data: []
//       });
//     }

//     res.status(200).json({
//         statusCode: 200,
//         message: "Users sucessfully retrieved",
//         data: allUsers
//     })
//   } catch (error) {
//     next(error);
//   }
// };

export const getUserById = async (req, res, next) => {
    const userId = req.params.userId;
  try {
    const getUser = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!getUser) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: getUser,
      message: "User retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// export const searchUsers = async (req, res, next) => {
//   try {
//     const { term } = req.query;
//     if (!term) {
//       return res.status(400).json({
//         statusCode: 400,
//         message: "Please provide a search term"
//       });
//     }

//     const words = term.trim().split(/\s+/)

//     // find user and select all info for login, password removed on res.
//     const users = await prisma.user.findMany({
//       where: {
//         OR: [
//           { email: { contains: term, mode: "insensitive" } },
//           ...words.map((word) => ({
//             AND: [
//               { firstName: { contains: word, mode: "insensitive" } },
//               { lastName: { contains: word, mode: "insensitive" } },
//             ],
//           })),
//           { firstName: { contains: term, mode: "insensitive" } },
//           { lastName: { contains: term, mode: "insensitive" } },
//         ],
//       },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         email: true,
//         isAdmin: true,
//       },
//     });

//     if (!users || users.length === 0) {
//       return res.status(200).json({
//         statusCode: 200,
//         message: "OK",
//       });
//     }

//     res.status(200).json({
//       statusCode: 200,
//       message: "User found",
//       data: users,
//     });
//   } catch (error) {
//     console.error("Search user error", error);
//     next(error);
//   }
// };


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