const express = require("express");
const cors = require("cors");

const connection = require("./config/db");
const authRoutes = require("./modules/auth/authRoutes");
const productRoutes = require("./modules/products/products.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const orderRoutes = require("./modules/orders/orders.routes");

const app = express();

// ✅ Enable CORS (VERY IMPORTANT)
app.use(cors({
  origin: "http://localhost:3000"
}));

// ✅ Parse JSON
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Health check (used by Kubernetes liveness probe)
app.get("/health", (req, res) => res.status(200).send("ok"));

// Optional test route
app.get("/api/test-db", async (req, res) => {
  try {
    const [results] = await connection.query("SELECT 1 + 1 AS result");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;