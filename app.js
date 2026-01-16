const express = require("express");
const cors = require("cors");
const dbConnection = require("./src/config/dbConfig");
const errorHandler = require("./src/middlewares/errorHandler");
const morgan = require("morgan");
const conditionalClerkMiddleware = require("./src/middlewares/clerkConditionalMiddleware.js");
const routes = require("./src/routes/index.js");
const corsConfig = require("./src/config/cors.js");

require("./src/cron/sessionNotifer.js");
require("./src/cron/salaryCron.js");

const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const { socketSetup } = require("./src/socket/socket.js");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 2000;

app.use(conditionalClerkMiddleware);
app.use(cors(corsConfig));

app.use(bodyParser.json());

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("views", __dirname + "/public");
app.engine("html", require("ejs").renderFile);

app.use("/api/v1", routes);

app.use("/health", (req, res) => {
  res.json({
    message: "The server is running successfully",
  });
});

app.use(errorHandler);

app.use("*", (req, res, next) => {
  const url = req.originalUrl;
  res.json({
    message: `${url} is not a valid endpoint`,
  });
});

dbConnection();

const server = app.listen(PORT, () => {
  console.log(`server running in http://localhost:${PORT}`);
});

socketSetup(server);
