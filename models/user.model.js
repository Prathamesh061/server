const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const eshop_user = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please, Enter your name"],
      maxLength: [30, "Name can't exceed 30 characters"],
      minLength: [4, "Name should have atleast 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Please, Enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please, Enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please, Enter your password"],
      minLength: [8, "Password should have at least 8 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Encrypt password
eshop_user.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Jwt session token
eshop_user.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare password
eshop_user.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

eshop_user.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("eshop_user", eshop_user);

module.exports = User;
