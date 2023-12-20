const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();

const pdfRootFolder = path.join(__dirname, '../PREIOUS  YEAR QUESTION PAPER');

router.get('/download/:year/:exam/:course/:filename', (req, res) => {
    const { year, exam, course, filename } = req.params;
    const filePath = path.join(pdfRootFolder, year, exam, course, filename);
  
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(err);
        return res.status(404).send('File Not Found');
      }
      const fileStream = fs.createReadStream(filePath);
      res.setHeader('Content-disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-type', 'application/pdf');
      fileStream.pipe(res);
    });
  });



  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { year, exam, course } = req.params;
      const uploadPath = path.join(pdfRootFolder, year, exam, course);
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
  
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Use the original file name for the uploaded file
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage });

  router.post('/upload/:year/:exam/:course', upload.single('pdf'), (req, res) => {
    res.send('File uploaded successfully!');
  });
  router.get('/:year/:exam/:course', (req, res) => {
    const { year, exam, course,level } = req.params;
    const folderPath = path.join(pdfRootFolder, year, exam, course);
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error hi');
      }
  
      res.json(files);
    });
  });

  router.get('/years', (req, res) => {
    fs.readdir(pdfRootFolder, (err, years) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error hi');
      }
  
      res.json(years);
    });
  });
  
  router.get('/exams/:year', (req, res) => {
    const { year } = req.params;
    const yearPath = path.join(pdfRootFolder, year);
  
    fs.readdir(yearPath, (err, exams) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error iin this');
      }
  
      res.json(exams);
    });
  });
  
  router.get('/courses_previous/:year/:exam', (req, res) => {
    const { year, exam } = req.params;
    const examPath = path.join(pdfRootFolder, year, exam);
  console.log(examPath,'pat')
    fs.readdir(examPath, (err, courses) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      res.json(courses);
    });
  });
  
 
module.exports = router;
