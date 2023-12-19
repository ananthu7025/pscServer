const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const currentAffairsFolder = path.join(__dirname, '../PSC BULLETTIN');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const { month, subfolder } = req.body; // assuming you send month and subfolder in the request body

            // Customize your folder structure here
            const destinationFolder = path.join(currentAffairsFolder, month, subfolder);

            if (!fs.existsSync(destinationFolder) || !fs.statSync(destinationFolder).isDirectory()) {
                fs.mkdirSync(destinationFolder, { recursive: true });
            }

            cb(null, destinationFolder);
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

router.get('/subfolders', (req, res) => {
    try {
        const mainSubfolders = fs.readdirSync(currentAffairsFolder);
        const subfolderData = [];

        mainSubfolders.forEach(mainSubfolder => {
            const mainSubfolderPath = path.join(currentAffairsFolder, mainSubfolder);
            const secondSubfolders = fs.readdirSync(mainSubfolderPath);

            const secondSubfolderData = secondSubfolders.map(secondSubfolder => {
                const secondSubfolderPath = path.join(mainSubfolderPath, secondSubfolder);
                const pdfFiles = fs.readdirSync(secondSubfolderPath).filter(file => file.toLowerCase().endsWith('.pdf'));
                return { subfolder: secondSubfolder, pdfFiles };
            });

            subfolderData.push({ mainSubfolder, secondSubfolders: secondSubfolderData });
        });

        res.json({ subfolders: subfolderData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/pscbullet_download/:month/:subfolder/:fileName', (req, res) => {
    try {
        const { month, subfolder, fileName } = req.params;
        const filePath = path.join(currentAffairsFolder, month, subfolder, fileName);
        console.log(filePath);
        if (fs.existsSync(filePath) && path.extname(filePath).toLowerCase() === '.pdf') {
            const fileStats = fs.statSync(filePath);
            console.log('File Size:', fileStats.size);
            const sanitizedFilename = encodeURIComponent(fileName);
            res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFilename}`);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Length', fileStats.size);

            const fileStream = fs.createReadStream(filePath);

            fileStream.on('error', (error) => {
                console.error('File Stream Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });

            console.log('Before piping file stream');
            fileStream.pipe(res);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/upload_pscbullet', upload.single('pdf'), (req, res) => {
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
