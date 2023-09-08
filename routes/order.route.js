const orderController = require("../controllers/order.controller");
const { authorizeRoles, authJWT } = require("../middlewares/auth");

module.exports = (app) => {
  app.post("/eshop/api/v1/order/new", [authJWT], orderController.createOrder);

  app.get(
    "/eshop/api/v1/order/:id",
    [authJWT],
    orderController.getOrderDetails
  );

  app.get(
    "/eshop/api/v1/admin/orders",
    [authJWT, authorizeRoles("admin")],
    orderController.getAllOrderDetails
  );

  app.get("/eshop/api/v1/orders/me", [authJWT], orderController.myOrders);

  app.put(
    "/eshop/api/v1/admin/order/:id",
    [authJWT, authorizeRoles("admin")],
    orderController.updateOrder
  );

  app.delete(
    "/eshop/api/v1/admin/order/:id",
    [authJWT, authorizeRoles("admin")],
    orderController.deleteOrder
  );
};
