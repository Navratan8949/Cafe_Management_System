const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CORS_ORIGIN
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // For reading jwt tokens from cookies

// Routes Import
const authRouter = require("./routes/auth.routes");
const managerRouter = require("./routes/manager.routes");
const superadminRouter = require("./routes/superadmin.routes");

const customerRouter = require("./routes/customer.routes");

// Route Declarations
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/manager", managerRouter);
app.use("/api/v1/superadmin", superadminRouter);

app.use("/api/v1/public", customerRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

module.exports = { app };
