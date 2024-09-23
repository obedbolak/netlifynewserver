const express = require("express");
const { isAdmin, isAuth } = require("./../middlewares/authMiddleware.js");
const orderController = require("../controllers/orderController.js");

const router = express.Router();

// ============== ORDERS ROUTES ==================

// CREATE ORDERS
router.post("/create", isAuth, orderController.createOrderController);

// GET ALL ORDERS
router.get("/my-orders", isAuth, orderController.getMyOrdersController);

// GET SINGLE ORDER DETAILS
router.get(
  "/my-orders/:id",
  isAuth,
  orderController.singleOrderDetailsController
);

// Accept payments
router.post("/payments", orderController.paymentsController);

// ======== ADMIN PART ============

// Get all orders
router.get(
  "/admin/get-all-orders",
  isAuth,
  isAdmin,
  orderController.getAllOrdersController
);

// Change order status
router.put(
  "/admin/order/:id",
  isAuth,
  isAdmin,
  orderController.changeOrderStatusController
);

// ====================================================================

module.exports = router;
