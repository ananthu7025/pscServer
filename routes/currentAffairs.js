const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const currentAffairsFolder = path.join(__dirname, '../CURRENT AFFAIRS');

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
        res.status(500).json({ error: 'Internal Server Error in this',error });
    }
});

router.get('/pdfs/:subfolder/:filename', (req, res) => {
    try {
        const subfolder = req.params.subfolder;
        const filename = req.params.filename;
        const filePath = path.join(currentAffairsFolder, subfolder, filename);

        if (fs.existsSync(filePath) && path.extname(filePath).toLowerCase() === '.pdf') {
            const sanitizedFilename = encodeURIComponent(filename);
            res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFilename}`);


            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.log(error)
    }
});

router.post('/upload', upload.single('pdf'), (req, res) => {
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

module.exports = router;
