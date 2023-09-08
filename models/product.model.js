const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eshop_product = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name required..."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description required..."],
    },
    price: {
      type: Number,
      required: [true, "Product price required..."],
      maxLength: [8, "Only 8 numbers"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Product category required"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock required"],
      default: 1,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "eshop_user",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "eshop_product",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = mongoose.model("eshop_product", eshop_product);

module.exports = Product;
