const { catchAsyncError } = require("../middlewares");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ProductModel = require("../models/product.model");

exports.processPayment = catchAsyncError(async (req, res, next) => {
  const { product } = req.body;

  let totalPrice = 0;

  const productPromises = product.map(async (item) => {
    const dbProduct = await ProductModel.findById(item.id);
    return dbProduct.price * item.quantity;
  });

  const productPrices = await Promise.all(productPromises);

  totalPrice = productPrices.reduce((acc, price) => acc + price, 0);

  const shippingCharge = totalPrice > 1000 ? 0 : 200;
  totalPrice += totalPrice * 0.18;
  totalPrice += shippingCharge;
  totalPrice *= 100;

  const myPayment = await stripe.paymentIntents.create({
    amount: totalPrice,
    currency: "inr",
    metadata: {
      company: "UrbanBazaar",
    },
  });

  res.status(200).json({
    success: true,
    client_secret: myPayment.client_secret,
  });
});

exports.sendStripeApiKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});
