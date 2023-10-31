const fs = require('fs');
const { google } = require('googleapis');
const multer = require('multer');
const express = require('express');
const { Readable } = require('stream');
const app = express();
const port = 3000;

const apikeys = require('./apikey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

async function authorize() {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPE
  );

  await jwtClient.authorize();

  return jwtClient;
}
async function uploadFile(authClient, file) {
    return new Promise((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
  
      const fileMetaData = {
        name: file.originalname,
        parents: ['1S6eL-7qCyhqdQnZshkjxRuZPn44h5XEK'],
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
  
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const authClient = await authorize();
    const uploadedFile = await uploadFile(authClient, req.file);
    res.json({ message: 'File uploaded to Google Drive', fileId: uploadedFile.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file to Google Drive' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
