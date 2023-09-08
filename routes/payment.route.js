const {
  processPayment,
  sendStripeApiKey,
} = require("../controllers/payment.controller");
const { authorizeRoles, authJWT } = require("../middlewares/auth");

module.exports = (app) => {
  app.post("/eshop/api/v1/payment/process", [authJWT], processPayment);
  app.get("/eshop/api/v1/stripeapikey", [authJWT], sendStripeApiKey);
};
