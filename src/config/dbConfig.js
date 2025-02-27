require("dotenv").config();
const mongoose = require("mongoose");
const seedProducts = require("../seeders/productSeeder");

function dbConnection() {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("db connected successfully");
    })
    .then(() => {
      seedProducts();
    })
    .catch((err) => {
      console.log("Error connecting to the database:", err);
    });
}

module.exports = dbConnection;
