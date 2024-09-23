const categoryModel = require("../models/categoryModel.js");
const productModel = require("../models/productModel.js");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { category } = req.body;

    // Validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Please provide category name",
      });
    }

    await categoryModel.create({ category });
    res.status(201).send({
      success: true,
      message: `${category} category created successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Create Category API",
    });
  }
};

// GET ALL CATEGORIES
const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "Categories fetched successfully",
      totalCat: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send({
      success: false,
      message: "Error In Get All Categories API",
    });
  }
};

// DELETE CATEGORY
const deleteCategoryController = async (req, res) => {
  try {
    // Find category
    const category = await categoryModel.findById(req.params.id);

    // Validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Find products with this category ID
    const products = await productModel.find({ category: category._id });

    // Update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }

    // Delete category
    await category.deleteOne();
    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
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
      message: "Error In DELETE Category API",
      error,
    });
  }
};

// UPDATE CATEGORY
const updateCategoryController = async (req, res) => {
  try {
    // Find category
    const category = await categoryModel.findById(req.params.id);

    // Validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Get new category
    const { updatedCategory } = req.body;

    // Find products with this category ID
    const products = await productModel.find({ category: category._id });

    // Update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = updatedCategory;
      await product.save();
    }

    if (updatedCategory) category.category = updatedCategory;

    // Save
    await category.save();
    res.status(200).send({
      success: true,
      message: "Category updated successfully",
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
      message: "Error In UPDATE Category API",
      error,
    });
  }
};

// Exporting the controllers
module.exports = {
  createCategory,
  getAllCategoriesController,
  deleteCategoryController,
  updateCategoryController,
};
