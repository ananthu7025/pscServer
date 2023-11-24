const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const credentials = require('../gd.json');
const { OAuth2Client } = require('google-auth-library');

const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPE = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file']

router.get('/getAuthURL', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
    });
    return res.send(authUrl);
});

router.post('/getToken', (req, res) => {
    if (req.body.code == null) return res.status(400).send('Invalid Request');
    oAuth2Client.getToken(req.body.code, (err, token) => {
        if (err) {
            console.error('Error retrieving access token', err);
            return res.status(400).send('Error retrieving access token');
        }
        res.send(token);
    });
});

router.post('/studyplan/:folderId', async (req, res) => {
    if (req.body.access_token == null) return res.status(400).send('Token not found');
    
    const folderId = req.params.folderId;

    if (!folderId) {
        return res.status(400).send('Folder ID is required');
    }

    oAuth2Client.setCredentials(req.body.access_token);
    try {
        const structuredFolders = await fetchDriveItems(oAuth2Client, folderId);
        res.json(structuredFolders);
    } catch (error) {
        console.error('Error in studyplan route: ', error);
        res.status(500).send('Internal Server Error');
    }
});

async function fetchDriveItems(oAuth2Client, folderId) {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name, webContentLink)',
    });

    const mainFolders = response.data.files || [];

    const structuredFolders = await Promise.all(mainFolders.map(async (mainFolder) => {
      const subfolders = await fetchSubfolders(drive, mainFolder.id);
      const subfoldersWithFiles = await Promise.all(subfolders.map(async (subfolder) => {
        const files = await fetchFiles(drive, subfolder.id);
        return { name: subfolder.name, files: files };
      }));

      return {
        name: mainFolder.name,
        subfolders: subfoldersWithFiles,
      };
    }));

    return structuredFolders;
  } catch (error) {
    console.error('Error fetching Google Drive data: ', error);
    throw new Error('Error fetching Google Drive data');
  }
}

async function fetchSubfolders(drive, folderId) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name, webContentLink)',
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error fetching subfolders: ', error);
    throw new Error('Error fetching subfolders');
  }
}

async function fetchFiles(drive, folderId) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, webContentLink)',
    });

    const files = response.data.files || [];

    const filesWithWebContentLink = files.map(file => ({
      name: file.name,
      webContentLink: file.webContentLink
    }));

    return filesWithWebContentLink;
  } catch (error) {
    console.error('Error fetching files: ', error);
    throw new Error('Error fetching files');
  }
}

module.exports = router;
