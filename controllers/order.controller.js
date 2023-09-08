const { catchAsyncError } = require("../middlewares");
const ErrorHandler = require("../utils/errorHandler");
const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");

exports.createOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await OrderModel.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

exports.getAllOrderDetails = catchAsyncError(async (req, res, next) => {
  const orders = await OrderModel.find().populate("user", "name email");

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

exports.getOrderDetails = catchAsyncError(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.myOrders = catchAsyncError(async (req, res, next) => {
  const orders = await OrderModel.find({
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (order.orderStatus === "delivered") {
    return next(
      new ErrorHandler("Order delivered - Can't modify the status", 400)
    );
  }

  if (req.body.status === "shipped") {
    order.orderItems.forEach(async (order) => {
      await updateStock(order.productId, order.quantity);
    });
  }

  order.orderStatus = req.body.status;

  if (order.orderStatus === "delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await ProductModel.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}
