const express = require("express");
const { isAdmin, isAuth } = require("./../middlewares/authMiddleware.js");
const {
  createCategory,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} = require("../controllers/categoryController.js");
const { multipleUpload } = require("../middlewares/multer.js");

const router = express.Router();

// routes
// ============== CAT ROUTES ==================

// CREATE CATEGORY
router.post("/create", multipleUpload, isAuth, isAdmin, createCategory);

// GET ALL CATEGORY
router.get("/get-all", getAllCategoriesController);

// DELETE  CATEGORY
router.delete("/delete/:id", isAuth, isAdmin, deleteCategoryController);

// UPDATE ALL CATEGORY
router.put("/update/:id", isAuth, isAdmin, updateCategoryController);

// ====================================================================

module.exports = router;
