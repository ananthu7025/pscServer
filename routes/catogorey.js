// routes/category.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/catogorey');

router.post('/create-category', categoryController.createCategory);
router.delete('/delete-category/:categoryId', categoryController.deleteCategory);
router.put('/edit-category/:categoryId', categoryController.editCategory);

// New route for getting all categories
router.get('/get-all-categories', categoryController.getAllCategories);
module.exports = router;


