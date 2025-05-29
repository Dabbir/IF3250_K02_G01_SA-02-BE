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
  origin: [
    'http://localhost:5173',
    'www.salmansustainability.org',
    'https://if-3250-k02-g01-sa-02-fe.vercel.app',
    'https://if-3250-k02-g01-sa-02-fe-marzuli-suhadas-projects.vercel.app',
    'https://if-3250-k02-g01-sa-02-fe-13522070-6684-marzuli-suhadas-projects.vercel.app',
    'https://if3250k02g01sa-02-be-production.up.railway.app',
  ],
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(passport.initialize());

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Salman Sustainability Report API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      auth: "/api/auth",
      account: "/api/account",
      publication: "/api/publication",
      masjid: "/api/masjid",
      beneficiary: "/api/beneficiary",
      trainings: "/api/trainings/",
      files: "/api/files",
    },
  });
});

// API Routes
app.use("/api", routes);

app.use(errorHandler); // Error handling middleware

module.exports = app;