const categoryModel = require("../models/categoryModel.js");
const productModel = require("../models/productModel.js");
const cloudinary = require("cloudinary");
const { getDataUri } = require("../utils/Features.js");
// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { category } = req.body;

    // Validation
    if (!category) {
      return res.status(400).send({
        success: false,
        message: "Please provide category name",
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Please provide category image",
      });
    }

    const imagePromises = req.files.map(async (file) => {
      const fileData = await getDataUri(file); // Await if getDataUri returns a promise
      const cdb = await cloudinary.v2.uploader.upload(fileData.content);
      return {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };
    });

    const images = await Promise.all(imagePromises);
    await categoryModel.create({ category, images });

    return res.status(201).send({
      success: true,
      message: `${category} category created successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error In Create Category API",
      error: error.message, // Include error message for debugging
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
    const { categoryId, category } = req.body;

    // Validation
    if (!categoryId) {
      return res.status(400).send({
        success: false,
        message: "Please provide the category ID",
      });
    }
    if (!category) {
      return res.status(400).send({
        success: false,
        message: "Please provide the category name",
      });
    }

    // Find the existing category
    const existingCategory = await categoryModel.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Handle images if provided
    let images = existingCategory.images; // Keep existing images by default

    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(async (file) => {
        const fileData = await getDataUri(file);
        const cdb = await cloudinary.v2.uploader.upload(fileData.content);
        return {
          public_id: cdb.public_id,
          url: cdb.secure_url,
        };
      });

      images = await Promise.all(imagePromises);
    }

    // Update category
    await categoryModel.findByIdAndUpdate(
      categoryId,
      { category, images },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: `${category} category updated successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in Update Category API",
      error: error.message, // Include error message for debugging
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
