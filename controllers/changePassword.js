import prisma from "../common/client.js";
import bcrypt from "bcrypt";

const changePassword = async (req, res, next) => {
  try {
    // if id passed in url - admin path, else, user path
    const targetUserId = req.params.id || req.user.id;
    const isSelf = targetUserId === req.user.id;
    const isAdmin = req.user.isAdmin;

    if(!isSelf && !isAdmin) {
      return res.status(403).json({
        statusCode: 403,
        message: "Forbidden: You can only change your own password",
      });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // check all basic fields are filled
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "New password and confirmation are required",
      });
    }
    // match passwords on confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        statusCode: 400,
        message: "Passwords do not match",
      });
    }
    // check is self with current password
    if (isSelf && !currentPassword) {
      return res.status(400).json({
        statusCode: 400,
        message: "Current password is required to change your own password",
      });
    }
    // safety net - if not self and not admin, permission denied
    if (!isSelf && !req.user.isAdmin) {
        return res.status(403).json({
            statusCode: 403,
            message: "Forbidden: Only admins can change other users' passwords",
        });
    }

    //  Fetch the user
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    //  Verify current password
    if (isSelf) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(401).json({
            statusCode: 401,
            message: "Current password is incorrect",
      });
      }
    }

    //  Save and hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: hashed },
    });

    //  Success response
    return res.status(200).json({
      statusCode: 200,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export default changePassword;