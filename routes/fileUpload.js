const express = require("express");
const multer = require("multer");
const { google } = require('googleapis');
const { Readable } = require('stream');
const apikeys = require('../apikey.json');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function authorize() {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    ['https://www.googleapis.com/auth/drive']
  );

  await jwtClient.authorize();

  return jwtClient;
}

async function uploadFile(authClient, file, parentFolderId) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: 'v3', auth: authClient });

    const fileMetaData = {
      name: file.originalname,
      parents: [parentFolderId],
    };

    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer),
    };

    drive.files.create(
      {
        resource: fileMetaData,
        media: media,
        fields: 'id',
      },
      function (error, uploadedFile) {
        if (error) {
          console.error('Error uploading file to Google Drive:', error);
          return reject(error);
        }
        resolve(uploadedFile);
      }
    );
  });
}

router.post('/previous-question', upload.single('file'), async (req, res) => {
  try {
    const authClient = await authorize();
    const uploadedFile = await uploadFile(authClient, req.file, '1wvgq3LapfLtbqE21wVcEsm5jDWNdDfnf');
    res.json({ message: 'File uploaded to Previous Question folder', fileId: uploadedFile.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file to Previous Question folder' });
  }
});

router.post('/psc-bulletin', upload.single('file'), async (req, res) => {
  try {
    const authClient = await authorize();
    const uploadedFile = await uploadFile(authClient, req.file, 'S6eL-7qCyhqdQnZshkjxRuZPn44h5XEK');
    res.json({ message: 'File uploaded to PSC Bulletin folder', fileId: uploadedFile.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file to PSC Bulletin folder' });
  }
});

router.post('/syllabus', upload.single('file'), async (req, res) => {
  try {
    const authClient = await authorize();
    const uploadedFile = await uploadFile(authClient, req.file, '1CW_4gKvVDsD5k0Dv-ODke1K654IcL9QM');
    res.json({ message: 'File uploaded to Syllabus folder', fileId: uploadedFile.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file to Syllabus folder' });
  }
});

module.exports = router;
