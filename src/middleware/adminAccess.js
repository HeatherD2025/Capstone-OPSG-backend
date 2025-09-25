

export default adminAccess = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    return res.status(403).json({
      statusCode: 403,
      message: "Access denied",
    });
  }
};