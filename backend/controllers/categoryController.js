const Category = require("../models/Category");

// Public: Get all active categories
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

// Admin: Get all categories (active and inactive)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

// Admin: Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, value, department } = req.body;
    
    if (!name || !value || !department) {
      return res.status(400).json({ message: "Name, value, and department are required" });
    }

    const existing = await Category.findOne({ value });
    if (existing) {
      return res.status(400).json({ message: "A category with this value already exists" });
    }

    const category = new Category({ name, value, department });
    await category.save();

    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: "Error creating category", error: err.message });
  }
};

// Admin: Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, value, department, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;
    if (value) category.value = value;
    if (department) category.department = department;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ message: "Error updating category", error: err.message });
  }
};
