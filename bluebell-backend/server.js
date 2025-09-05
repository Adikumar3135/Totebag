require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const bodyParser = require("body-parser");

// node-fetch v3 dynamic wrapper
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// CORS configuration - add your real frontend URL to this array after deployment
const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://your-frontend-domain.com"
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow tools like Postman or server-to-server
    if(allowedOrigins.indexOf(origin) !== -1){
      return callback(null, true);
    } else {
      return callback(new Error("CORS policy: Origin not allowed"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());
app.use(bodyParser.json());

// Razorpay init
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Health
app.get("/", (req, res) => { res.send("✅ BlueBell Backend is running"); });

// Create order
app.post("/api/orders/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify payment & push to Google Sheets
app.post("/api/orders/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, contact, address, products, amount } = req.body;

    const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.json({ success: false, message: "Invalid signature" });
    }

    const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, contact, address, products, amount,
        payment_id: razorpay_payment_id, order_id: razorpay_order_id, status: "Paid"
      })
    });

    const text = await response.text();
    console.log("Google Script (Paid):", text);
    res.json({ success: true, response: text });
  } catch (err) {
    console.error("Verify order error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save COD
app.post("/api/orders/save-cod", async (req, res) => {
  try {
    const { name, email, contact, address, products, amount } = req.body;
    const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, contact, address, products, amount, payment_id: "N/A", order_id: "N/A", status: "COD" })
    });
    const text = await response.text();
    console.log("Google Script (COD):", text);
    res.json({ success: true, response: text });
  } catch (err) {
    console.error("Save COD error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Smart port handling
const DEFAULT_PORT = process.env.PORT || 5000;
function startServer(port){
  const server = app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${port} in use, trying ${port+1}...`);
      startServer(port+1);
    } else {
      console.error("Server error:", err);
    }
  });
}
startServer(Number(DEFAULT_PORT));
