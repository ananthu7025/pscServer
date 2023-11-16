
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');
const { OAuth2Client } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json';
const credentialsPath = './gd.json';

router.get('/api/drive/items', async (req, res) => {
  const { folderId } = req.query;

  if (!folderId) {
    return res.status(400).json({ error: 'Missing folderId parameter' });
  }

  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const oAuth2Client = await authorize(credentials);
    const data = await fetchDriveItems(oAuth2Client, folderId);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    return [];
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

function authorize(credentials) {
  return new Promise((resolve, reject) => {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        console.log('No token found, getting a new one...');
        return getAccessToken(oAuth2Client)
          .then((token) => {
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) console.error(err);
              console.log('Token stored to', TOKEN_PATH);
            });
            resolve(oAuth2Client);
          })
          .catch((err) => reject(err));
      }

      try {
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      } catch (parseError) {
        console.error('Error parsing token file:', parseError);
        getAccessToken(oAuth2Client)
          .then((token) => {
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) console.error(err);
              console.log('Token stored to', TOKEN_PATH);
            });
            resolve(oAuth2Client);
          })
          .catch((err) => reject(err));
      }
    });
  });
}

function getAccessToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('Error retrieving access token:', err);
          reject(err);
        }
        resolve(token);
      });
    });
  });
}

module.exports = router;
