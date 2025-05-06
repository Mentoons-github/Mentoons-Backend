import { fetchAllPosts, uploadPost } from "../controllers/adda";

const express = require("express");

const addaRouter = express.Router();

addaRouter.route("/").get(fetchAllPosts).post(uploadPost);

export default addaRouter;
