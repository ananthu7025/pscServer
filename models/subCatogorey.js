// models/subcategory.js
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: String,
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
});

module.exports = mongoose.model('Subcategory', subcategorySchema);