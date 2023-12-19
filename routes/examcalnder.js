const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const currentAffairsFolder = path.join(__dirname, '../EXAM CALENDER _ SYLLABUS');

router.get('/exam_calnder', (req, res) => {
  try {
    const folders = fs.readdirSync(currentAffairsFolder);
    res.json({ folders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/exam_calnder/files/:folder', (req, res) => {
  try {
    const selectedFolder = req.params.folder || '';
    const folderPath = path.join(currentAffairsFolder, selectedFolder);
    const pdfFiles = fs.readdirSync(folderPath).filter(file => file.toLowerCase().endsWith('.pdf'));
    res.json({ pdfFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/download/:folder/:filename', (req, res) => {
    try {
      const selectedFolder = req.params.folder;
      const filename = req.params.filename;
      const filePath = path.join(currentAffairsFolder, selectedFolder, filename);
  
      if (fs.existsSync(filePath) && path.extname(filePath).toLowerCase() === '.pdf') {
        const fileStream = fs.createReadStream(filePath);
  
        // Set the appropriate headers for PDF content and attachment
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  
        // Pipe the file stream to the response
        fileStream.pipe(res);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      console.error(error);
    }
  });
  
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const subfolder = req.query.subfolder || '';
            const subfolderPath = path.join(currentAffairsFolder, subfolder);
            if (!fs.existsSync(subfolderPath) || !fs.statSync(subfolderPath).isDirectory()) {
                fs.mkdirSync(subfolderPath, { recursive: true });
            }

            cb(null, subfolderPath);
        } catch (error) {
            console.error(error);
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });
router.post('/exam/upload', upload.single('pdf'), (req, res) => {
    try {
        const subfolder = req.query.subfolder || '';
        const subfolderPath = path.join(currentAffairsFolder, subfolder);
        if (!fs.existsSync(subfolderPath) || !fs.statSync(subfolderPath).isDirectory()) {
            fs.mkdirSync(subfolderPath, { recursive: true });
        }
        res.json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  
  
  
  router.get('/exam_calnder/subfolders', (req, res) => {
    try {
        
      const subfolders = fs.readdirSync(currentAffairsFolder).map(subfolder => ({ value: subfolder, label: subfolder }));
      res.json({ subfolders });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  



module.exports = router;
