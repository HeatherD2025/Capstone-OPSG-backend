// TEST CODE
import prisma from "../common/client.js";
import bcrypt from "bcrypt";

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id; // supports /me or /:userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        company: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            streetAddress: true,
            city: true,
            state: true,
            zip: true,
          }
         }
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
  try {
    const userId = req.params.userId || req.user.id; // support /me or /:userId

    const { 
      firstName, 
      lastName, 
      email,
      company = {}, 
    } = req.body;

    const {
      name,
      streetAddress,
      city,
      state,
      zip,
      phoneNumber,
    } = company;

    if (
      !firstName && 
      !lastName && 
      !email &&
      Object.keys(company).length === 0
    ) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "No valid fields provided for update",
      });
    }

    const userUpdateData = {};
    if (firstName) userUpdateData.firstName = firstName.trim();
    if (lastName) userUpdateData.lastName = lastName.trim();
    if (email) userUpdateData.email = email.trim().toLowerCase();

    const companyUpdateData = {};
    if (name) companyUpdateData.name = name.trim();
    if (streetAddress) companyUpdateData.streetAddress = streetAddress.trim();
    if (city) companyUpdateData.city = city.trim();
    if (state) companyUpdateData.state = state.trim();
    if (zip) companyUpdateData.zip = Number(zip);
    if (phoneNumber) companyUpdateData.phoneNumber = phoneNumber.trim();

    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user (only if needed)
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      // Update company (only if needed)
      if (Object.keys(companyUpdateData).length > 0) {
        const userWithCompany = await tx.user.findUnique({
          where: { id: userId },
          select: { companyId: true },
        });

        if (!userWithCompany?.companyId) {
          throw new Error("User has no associated company");
        }

        await tx.company.update({
          where: { id: userWithCompany.companyId },
          data: companyUpdateData,
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
        },
      });
    });

    return res.status(200).json({
      statusCode: 200,
      data: updatedUser,
      message: "Profile successfully updated",
    });
  } catch (error) {
    next(error);
  }
};

