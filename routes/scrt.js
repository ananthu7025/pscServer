const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const pdfDirectory = path.join(__dirname, '..', 'SCERT STUDY PLAN');

// Recursive function to get all folders, subfolders, and files
function getDirectoryContents(directory) {
  const contents = [];
  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      contents.push({
        type: 'folder',
        name: item,
        contents: getDirectoryContents(itemPath),
      });
    } else {
      contents.push({
        type: 'file',
        name: item,
      });
    }
  });

  return contents;
}

router.get('/list', (req, res) => {
  const directoryContents = getDirectoryContents(pdfDirectory);
  res.json(directoryContents);
});
router.get('/scrt/download/:subfolder/:day/:filename', (req, res) => {
    const { subfolder, day, filename } = req.params;
    const filePath = path.join(pdfDirectory, subfolder, day, `${filename}`);
    res.download(filePath, `${filename}.pdf`);
  });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { mainsubfolder, secondsubfolder } = req.params;
      const uploadPath = path.join(pdfDirectory, mainsubfolder, secondsubfolder);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
  
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileName = file.originalname.replace(/\s/g, '_');
      cb(null, fileName);
    },
  });
  
  const upload = multer({ storage: storage });
  
  router.post('/upload_SCRT/:mainsubfolder/:secondsubfolder', upload.single('pdf'), (req, res) => {
    res.json({ message: 'File uploaded successfully!' });
  });
module.exports = router;
