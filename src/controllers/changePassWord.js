const bcrypt = require("bcrypt");
const { prisma } = require("../common/common");

async function changePassword(req, res, next) {
  try {
    console.log("→ changePassword.params:", req.params);
    console.log("→ changePassword.body:  ", req.body);
    //  Param check
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: "User ID is required",
      });
    }

    //  Body check
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "currentPassword, newPassword, and confirmPassword are all required",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        statusCode: 400,
        message: "newPassword and confirmPassword do not match",
      });
    }

    //  Fetch the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    //  Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        statusCode: 401,
        message: "Current password is incorrect",
      });
    }

    //  Save and hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    //  Success response
    return res.status(200).json({
      statusCode: 200,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
}

module.exports = { changePassword };
