const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const colors = require("colors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("../config/db.js");
require("dotenv").config();

// Database connection
connectDB();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
const testRoutes = require("../routes/testRoutes.js");
const userRoutes = require("../routes/userRoutes.js");
const productRoutes = require("../routes/productRoutes.js");
const categoryRoutes = require("../routes/categoryRoutes.js");
const orderRoutes = require("../routes/orderRoutes.js");

app.use("/.netlify/functions/api/v1", testRoutes);
app.use("/.netlify/functions/api/v1/user", userRoutes);
app.use("/.netlify/functions/api/v1/product", productRoutes);
app.use("/.netlify/functions/api/v1/cat", categoryRoutes);
app.use("/.netlify/functions/api/v1/order", orderRoutes);

app.get("/.netlify/functions/api", (req, res) => {
  res.json({ message: "Hello from the API!" });
});

app.post("/.netlify/functions/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, customer } = req.body;

    if (!amount || !customer || !customer.name || !customer.email) {
      return res.status(400).json({
        error: "Amount and customer details are required.",
      });
    }

    let stripeCustomer;
    const doesCustomerExist = await stripe.customers.list({
      email: customer.email,
    });

    if (doesCustomerExist.data.length > 0) {
      stripeCustomer = doesCustomerExist.data[0];
    } else {
      const newCustomer = await stripe.customers.create({
        name: customer.name,
        email: customer.email,
      });

      stripeCustomer = newCustomer;
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: stripeCustomer.id },
      { apiVersion: "2024-06-20" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      customer: stripeCustomer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        customer_name: customer.name,
        customer_email: customer.email,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: stripeCustomer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the payment." });
  }
});

module.exports.handler = serverless(app);
