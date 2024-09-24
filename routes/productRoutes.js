const express = require("express");
const { isAdmin, isAuth } = require("./../middlewares/authMiddleware.js");
const productController = require("../controllers/productController.js");
const { singleUpload, multipleUpload } = require("../middlewares/multer.js");

const router = express.Router();

// routes
// ============== PRODUCT ROUTES ==================

// CREATE PRODUCT
router.post(
  "/create",
  isAuth,
  isAdmin,
  multipleUpload,

  productController.createProductController
);

// GET ALL PRODUCTS
router.get("/get-all", productController.getAllProductsController);

// GET SINGLE PRODUCT
router.get("/:id", productController.getSingleProductController);

// GET TOP PRODUCTS
router.get("/list/top-products", productController.getTopProductsController);

// DELETE PRODUCT
router.delete(
  "/:id",
  isAuth,
  isAdmin,
  productController.deleteProductController
);

// DELETE PRODUCT IMAGE
router.delete(
  "/:id/image",
  isAuth,
  isAdmin,
  productController.deleteProductImageController
);

router.delete(
  "/:id/image/spec",
  isAuth,
  isAdmin,
  productController.deleteSpecificProductImageController
);

// UPDATE PRODUCT
router.put("/:id", isAuth, isAdmin, productController.updateProductController);

// UPDATE PRODUCT IMAGE
router.put(
  "/:id/image",
  isAuth,
  isAdmin,
  singleUpload,
  productController.updateProductImageController
);

// PRODUCT REVIEW
router.post("/:id/review", isAuth, productController.productReviewController);

// ====================================================================

module.exports = router;
