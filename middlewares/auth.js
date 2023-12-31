const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

exports.authJWT = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please, Login in", 401));
  }

  const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = await UserModel.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new ErrorHandler(
          `Role: ${req.user.role} is unauthorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};
