const orderModel = require("../models/orderModel.js");
const productModel = require("../models/productModel.js");
const { stripe } = require("../functions/api.js");

// CREATE ORDERS
const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;

    // Create order
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    // Stock update
    for (let i = 0; i < orderItems.length; i++) {
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }

    res.status(201).send({
      success: true,
      message: "Order Placed Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Create Order API",
      error,
    });
  }
};

// GET ALL ORDERS - MY ORDERS
const getMyOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({ user: req.user._id });

    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "No orders found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Your orders data",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In My Orders API",
      error,
    });
  }
};

// GET SINGLE ORDER INFO
const singleOrderDetailsController = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "No order found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Your order fetched",
      order,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Get Order Details API",
      error,
    });
  }
};

// ACCEPT PAYMENTS
const paymentsController = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(404).send({
        success: false,
        message: "Total Amount is required",
      });
    }

    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount * 100),
      currency: "usd",
    });

    res.status(200).send({
      success: true,
      client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Payment API",
      error,
    });
  }
};

// ========== ADMIN SECTION =============

// GET ALL ORDERS
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "All Orders Data",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get All Orders API",
      error,
    });
  }
};

// CHANGE ORDER STATUS
const changeOrderStatusController = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "processing") {
      order.orderStatus = "shipped";
    } else if (order.orderStatus === "shipped") {
      order.orderStatus = "delivered";
      order.deliveredAt = Date.now();
    } else {
      return res.status(500).send({
        success: false,
        message: "Order already delivered",
      });
    }

    await order.save();
    res.status(200).send({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Update Order Status API",
      error,
    });
  }
};

// Exporting the controllers
module.exports = {
  createOrderController,
  getMyOrdersController,
  singleOrderDetailsController,
  paymentsController,
  getAllOrdersController,
  changeOrderStatusController,
};
