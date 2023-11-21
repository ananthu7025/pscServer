// controllers/category.js
const Category = require('../models/catogorey');

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.json({ message: 'Category created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Category creation failed' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
const editCategory = async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { name } = req.body;
  
      const category = await Category.findByIdAndUpdate(categoryId, { name }, { new: true });
  
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      res.json({ message: 'Category updated successfully', category });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update category' });
    }
  };
  
  const getAllCategories = async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get categories' });
    }
  };
module.exports = { createCategory, deleteCategory,editCategory,getAllCategories };

