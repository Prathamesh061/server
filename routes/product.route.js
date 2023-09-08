const productController = require("../controllers/product.controller");
const { auth } = require("../middlewares");
// route to save a new product to the database
module.exports = (app) => {
  app.delete(
    "/eshop/api/v1/product/reviews",
    [auth.authJWT],
    productController.deleteReview
  );

  app.get("/eshop/api/v1/product/reviews", productController.getAllReviews);

  app.post(
    "/eshop/api/v1/admin/product/new",
    [auth.authJWT, auth.authorizeRoles("admin")],
    productController.createProduct
  );

  app.get("/eshop/api/v1/product/:id", productController.getDetails);

  app.put(
    "/eshop/api/v1/admin/product/:id",
    [auth.authJWT, auth.authorizeRoles("admin")],
    productController.updateProduct
  );

  app.delete(
    "/eshop/api/v1/admin/product/:id",
    [auth.authJWT, auth.authorizeRoles("admin")],
    productController.deleteProduct
  );

  app.get(
    "/eshop/api/v1/admin/products",
    [auth.authJWT, auth.authorizeRoles("admin")],
    productController.getAdminProducts
  );

  app.put(
    "/eshop/api/v1/product/review",
    [auth.authJWT],
    productController.createProductReview
  );

  app.get("/eshop/api/v1/products", productController.getAllProducts);
};
