require("dotenv").config(); // Environmental variables initialization
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("./utils/database")(); // Database initialization
const { catchError } = require("./middlewares");
const ErrorHandler = require("./utils/errorHandler");
const cors = require("cors");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const app = express();

// view engine setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(logger("dev"));
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(fileUpload());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "./client/build")));

// Use Routers
require("./routes/product.route")(app);
require("./routes/user.route")(app);
require("./routes/order.route")(app);
require("./routes/payment.route")(app);

// If a route is not matched, serve the React app's index.html
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Page not found
app.use(function (req, res, next) {
  next(new ErrorHandler("Page not found...", 404));
});

// Error Handling
app.use(catchError);

module.exports = app;
