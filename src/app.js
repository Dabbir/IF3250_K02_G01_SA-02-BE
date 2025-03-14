const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("dotenv").config();

const { specs, swaggerUi } = require("./config/swagger.config");
const { errorHandler } = require("./middlewares/error.middleware");
const routes = require("./routes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Salman Sustainability Report API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      auth: "/api/auth",
      account: "/api/account",
    },
  });
});

// API Routes
app.use("/api", routes);

app.use(errorHandler); // Error handling middleware

module.exports = app;