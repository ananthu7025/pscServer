// routes/subcategory.js
const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcatogorey');

router.post('/create-subcategory', subcategoryController.createSubcategory);
router.delete('/delete-subcategory/:subcategoryId', subcategoryController.deleteSubcategory);

// New route for editing a subcategory
router.put('/edit-subcategory/:subcategoryId', subcategoryController.editSubcategory);

// New route for getting all subcategories
router.get('/get-all-subcategories', subcategoryController.getAllSubcategories);
module.exports = router;