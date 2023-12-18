const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const currentAffairsFolder = path.join(__dirname, '../CURRENT AFFAIRS');
const pdfFolder = path.join(__dirname, '../pdf');  // Assuming this is the folder for storing uploaded PDFs

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, currentAffairsFolder); // Use currentAffairsFolder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.get('/current_affairs', (req, res) => {
  try {
    const subfolders = fs.readdirSync(currentAffairsFolder);
    const folderData = [];

    subfolders.forEach(subfolder => {
      const subfolderPath = path.join(currentAffairsFolder, subfolder);
      const pdfFiles = fs.readdirSync(subfolderPath).filter(file => file.toLowerCase().endsWith('.pdf'));
      folderData.push({ subfolder, pdfFiles });
    });

    res.json({ folders: folderData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to download a specific PDF file
router.get('/pdf/:subfolder/:filename', (req, res) => {
  try {
    const subfolder = req.params.subfolder;
    const filename = req.params.filename;
    const filePath = path.join(currentAffairsFolder, subfolder, filename);

    // Check if the file exists
    if (fs.existsSync(filePath) && path.extname(filePath).toLowerCase() === '.pdf') {
      // Set the headers for file download
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/pdf');

      // Read the file and stream it to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // File not found or not a PDF
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    // Handle any errors that might occur (e.g., folder not found)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to upload a PDF file to currentAffairsFolder
router.post('/upload', upload.single('pdf'), (req, res) => {
  res.json({ success: true, message: 'File uploaded successfully' });
});

module.exports = router;
