const mongoose = require("mongoose");
const dbConfig = require("../config/db.config");

/**
 * DB Connection initialization
 */

module.exports = function () {
  mongoose.connect(dbConfig.DB_URL);
  const db = mongoose.connection;
  db.once("open", () => {
    console.log("connected to Mongo DB ");
  });
};
