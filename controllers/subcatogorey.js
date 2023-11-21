
// controllers/subcategory.js
const Subcategory = require('../models/subCatogorey');

const createSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const subcategory = new Subcategory({ name, categoryId });
    await subcategory.save();
    res.json({ message: 'Subcategory created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Subcategory creation failed' });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const subcategory = await Subcategory.findByIdAndDelete(subcategoryId);

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({ message: 'Subcategory deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
};const editSubcategory = async (req, res) => {
    try {
      const { subcategoryId } = req.params;
      const { name, categoryId } = req.body;
  
      const subcategory = await Subcategory.findByIdAndUpdate(subcategoryId, { name, categoryId }, { new: true });
  
      if (!subcategory) {
        return res.status(404).json({ error: 'Subcategory not found' });
      }
  
      res.json({ message: 'Subcategory updated successfully', subcategory });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update subcategory' });
    }
  };
  
  const getAllSubcategories = async (req, res) => {
    try {
      const subcategories = await Subcategory.find();
      res.json(subcategories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get subcategories' });
    }
  };

module.exports = { createSubcategory, deleteSubcategory,getAllSubcategories,editSubcategory };