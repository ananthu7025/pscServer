const express = require('express');
const Folder = require('../models/folders');

const router = express.Router();

router.post('/', async (req, res) => {
  const { year, month,folderId } = req.body;

  try {
    const newFolder = new Folder({ year, month,folderId });
    await newFolder.save();
    res.status(201).json(newFolder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.get('/', async (req, res) => {
    try {
      const folders = await Folder.find({});
      res.json(folders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
module.exports = router;
