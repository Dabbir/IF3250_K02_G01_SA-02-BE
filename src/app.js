const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("dotenv").config();

const { specs, swaggerUi } = require("./config/swagger.config");
const { errorHandler } = require("./middlewares/error.middleware");
const routes = require("./routes");
const passport = require("./config/passport.config")

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ORIGIN,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(passport.initialize());

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
      publikasi: "/api/publikasi",
    },
  });
});

// API Routes
app.use("/api", routes);

app.use(errorHandler); // Error handling middleware

module.exports = app;