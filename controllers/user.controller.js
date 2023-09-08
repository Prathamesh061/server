const { catchAsyncError } = require("../middlewares");
const ErrorHandler = require("../utils/errorHandler");
const UserModel = require("../models/user.model");
const sendJWTTokenCookie = require("../utils/setJWTTokenCookie");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const User = require("../models/user.model");
const cloudinary = require("cloudinary");

// To Register a user
exports.registerUser = catchAsyncError(async (req, res) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "user_avatars",
    width: 150,
    height: 150,
    crop: "scale",
  });
  const { name, email, password } = req.body;

  const user = await UserModel.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendJWTTokenCookie(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please, Enter user credentials", 400));
  }

  const user = await UserModel.findOne({
    email,
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid user credentials", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid user credentials", 401));
  }

  sendJWTTokenCookie(user, 200, res);
});

exports.logoutUser = catchAsyncError(async (req, res) => {
  res.clearCookie("token", { httpOnly: true });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findOne({
    email: req.body.email,
  });

  if (!user) {
    next(new ErrorHandler("Invalid user credentials: Email", 404));
  }

  // Get reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save();

  const resetPasswordURL = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  try {
    await sendEmail({
      name: user.name,
      email: user.email,
      subject: "UrbanBazaar Password Recovery",
      resetPasswordURL,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return next(new ErrorHandler(err.message, 500));
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset password link is invalid or expired.", 401)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match.", 401));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendJWTTokenCookie(user, 200, res);
});

exports.getDetails = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Confirm Password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendJWTTokenCookie(user, 200, res);
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      height: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await UserModel.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.getUserById = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id:${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  let user = UserModel.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  user = await UserModel.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });

  res.status(200).json({
    success: true,
  });
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: `User with Id:${req.params.id} deleted successfully`,
  });
});
