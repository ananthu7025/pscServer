// route.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');
const { OAuth2Client } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json';
const credentialsPath = './gd.json';

router.get('/folder/files', (req, res) => {
  const { folderId } = req.query;

  if (!folderId) {
    return res.status(400).json({ error: 'Missing folderId parameter' });
  }

  fs.readFile(credentialsPath, 'utf8', (err, content) => {
    if (err) return res.status(500).json({ error: 'Error reading client secret file' });

    try {
      const credentials = JSON.parse(content);
      authorize(credentials, (oAuth2Client) => {
        listSubfoldersAndFiles(oAuth2Client, folderId, (data) => {
          res.json(data);
        });
      });
    } catch (parseError) {
      console.error('Error parsing client secret file:', parseError);
      res.status(500).json({ error: 'Error parsing client secret file' });
    }
  });
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      console.log('No token found, getting a new one...');
      return getAccessToken(oAuth2Client, callback);
    }

    try {
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    } catch (parseError) {
      console.error('Error parsing token file:', parseError);
      getAccessToken(oAuth2Client, callback);
    }
  });
}

function getAccessToken(oAuth2Client, callback) {
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
    code = decodeURIComponent(code); 
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token:', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listSubfoldersAndFiles(oAuth2Client, folderId, callback) {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  drive.files.list(
    {
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      pageSize: 50,
      fields: 'nextPageToken, files(id, name)',
    },
    (subfoldersErr, subfoldersRes) => {
      if (subfoldersErr) {
        console.error('Error retrieving subfolders:', subfoldersErr);
        return callback({ error: 'Error retrieving subfolders' });
      }

      const mainFolderData = {
        folderId: folderId,
        folderName: subfoldersRes.data.files[0].name,
        subfolders: [],
      };

      const subfolders = subfoldersRes.data.files || [];
      let completedSubfolders = 0;

      subfolders.forEach((subfolder) => {
        listFilesInSubfolder(drive, subfolder.id, (files) => {
          mainFolderData.subfolders.push({
            folderId: subfolder.id,
            folderName: subfolder.name,
            files: files,
          });

          completedSubfolders++;

          if (completedSubfolders === subfolders.length) {
            callback(mainFolderData);
          }
        });
      });
    }
  );
}

function listFilesInSubfolder(drive, subfolderId, callback) {
  drive.files.list(
    {
      q: `'${subfolderId}' in parents`,
      pageSize: 50,
      fields: 'nextPageToken, files(id, name, webViewLink, mimeType)',
    },
    (filesErr, filesRes) => {
      if (filesErr) {
        console.error('Error retrieving files:', filesErr);
        return callback({ error: 'Error retrieving files' });
      }

      const files = filesRes.data.files || [];
      callback(files);
    }
  );
}

module.exports = router;
