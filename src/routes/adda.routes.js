const { fetchAllPosts, uploadPost } = require("../controllers/adda");

const express = require("express");

const addaRouter = express.Router();

addaRouter.route("/").get(fetchAllPosts).post(uploadPost);

module.exports = addaRouter;
