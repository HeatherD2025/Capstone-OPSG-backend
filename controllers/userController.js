// import prisma from "../common/client.js";

// export const getUserById = async (req, res, next) => {
//   try {
//     // extract user id from jwt
//     const userId = req.user.id;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         firstName: true,
//         lastName: true,
//         email: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({
//         statusCode: 404,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       data: user,
//       message: "User successfully retrieved",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateUserProfile = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const { firstName, lastName, email } = req.body;

//     if (!firstName && !lastName && !email) {
//       return res.status(400).json({
//         statusCode: 400,
//         message:
//           "At least one of firstName, lastName, or email must be provided",
//       });
//     }

//     const updateData = {};
//     if (firstName) updateData.firstName = firstName.trim();
//     if (lastName) updateData.lastName = lastName.trim();
//     if (email) updateData.email = email.trim().toLowerCase();

//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: updateData,
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         email: true,
//       },
//     });

//     return res.status(200).json({
//       statusCode: 200,
//       data: updatedUser,
//       message: "User profile successfully updated",
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// TEST CODE
import prisma from "../common/client.js";

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id; // support /me or /:userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true },
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
  try {
    const userId = req.params.userId || req.user.id; // support /me or /:userId
    const { firstName, lastName, email } = req.body;

    if (!firstName && !lastName && !email) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "At least one of firstName, lastName, or email must be provided",
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    return res.status(200).json({
      statusCode: 200,
      data: updatedUser,
      message: "User profile successfully updated",
    });
  } catch (error) {
    next(error);
  }
};
