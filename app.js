const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const dbConnection = require("./src/config/dbConfig");
const errorHandler = require("./src/middlewares/errorHandler");
const routes = require("./src/routes/index.js");
const corsConfig = require("./src/config/cors.js");

const conditionalClerkMiddleware = require("./src/middlewares/clerkConditionalMiddleware.js");
const clerkWebhook = require("./src/controllers/webhook/clerkWebhook.controller.js");

const { socketSetup } = require("./src/socket/socket.js");

require("./src/cron/sessionNotifer.js");
require("./src/cron/salaryCron.js");
require("./src/cron/emi");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 2000;

app.use(conditionalClerkMiddleware);
app.use(cors(corsConfig));
app.use(bodyParser.json());

app.post("/api/v1/webhook/clerk", clerkWebhook);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("views", __dirname + "/public");
app.engine("html", require("ejs").renderFile);

app.use("/api/v1", routes);

app.get("/health", (req, res) => {
  res.json({ message: "The server is running successfully" });
});

app.use(errorHandler);

app.use("*", (req, res) => {
  res.status(404).json({
    message: `${req.originalUrl} is not a valid endpoint`,
  });
});

dbConnection();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

socketSetup(server);

module.exports = app;
