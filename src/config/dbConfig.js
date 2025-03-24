require("dotenv").config();
const mongoose = require("mongoose");
const seedProducts = require("../seeders/productSeeder");
const Product = require("../models/product");

function dbConnection() {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("db connected successfully");
    })
    .then(async () => {
      await seedProducts();
    }) // Seed the products collectio

    .catch((err) => {
      console.log("Error connecting to the database:", err);
    });
}

module.exports = dbConnection;
