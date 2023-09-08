const Mailgen = require("mailgen");

// Configure mailgen by setting a theme and your product info
module.exports = new Mailgen({
  theme: "salted",
  product: {
    name: "UrbanBazaar",
    link: "https://heylack-portfolio.web.app/",
  },
});
