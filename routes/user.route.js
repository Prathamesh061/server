const userController = require("../controllers/user.controller");
const { auth } = require("../middlewares");

module.exports = (app) => {
  app.post("/eshop/api/v1/register", userController.registerUser);
  app.post("/eshop/api/v1/login", userController.loginUser);
  app.get("/eshop/api/v1/logout", userController.logoutUser);
  app.post("/eshop/api/v1/password/forgot", userController.forgotPassword);
  app.put(
    "/eshop/api/v1/password/update",
    [auth.authJWT],
    userController.updatePassword
  );
  app.put("/eshop/api/v1/password/reset/:token", userController.resetPassword);
  app.get("/eshop/api/v1/me", [auth.authJWT], userController.getDetails);
  app.put(
    "/eshop/api/v1/me/update",
    [auth.authJWT],
    userController.updateProfile
  );
  app.get(
    "/eshop/api/v1/admin/users",
    [auth.authJWT, auth.authorizeRoles("admin")],
    userController.getAllUser
  );

  app.get(
    "/eshop/api/v1/admin/user/:id",
    [auth.authJWT, auth.authorizeRoles("admin")],
    userController.getUserById
  );

  app.put(
    "/eshop/api/v1/admin/user/:id",
    [auth.authJWT, auth.authorizeRoles("admin")],
    userController.updateUserRole
  );

  app.delete(
    "/eshop/api/v1/admin/user/:id",
    [auth.authJWT, auth.authorizeRoles("admin")],
    userController.deleteUser
  );
};
