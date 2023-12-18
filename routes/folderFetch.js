const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const credentials = require('../gd.json');

const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPE = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file']

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
        return         res.status(500).send('Internal Server Error');
      }

      const mainFolderData = {
        folderId: folderId,
        folderName: subfoldersRes.data.files.length > 0 ? subfoldersRes.data.files[0].name : '',
        subfolders: [],
      };

      const subfolders = subfoldersRes.data.files || [];
      let completedSubfolders = 0;

      if (subfolders.length === 0) {
        callback(mainFolderData);
      }

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
        return         res.status(500).send('Internal Server Error');
      }

      const files = filesRes.data.files || [];
      callback(files);
    }
  );
}

router.get('/getAuthURL', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPE,
  });
  return res.send(authUrl);
});

router.post('/getToken', (req, res) => {
  if (!req.body.code) {
    return         res.status(500).send('Internal Server Error');
  }

  oAuth2Client.getToken(req.body.code, (err, token) => {
    if (err) {
      console.error('Error retrieving access token', err);
      return         res.status(500).send('Internal Server Error');
    }
    res.send(token);
  });
});

router.post('/specialTopic/:folderId', (req, res) => {
  if (!req.body.access_token) {
    return         res.status(500).send('Internal Server Error');
  }

  const folderId = req.params.folderId;

  if (!folderId) {
    return         res.status(500).send('Internal Server Error');
  }

  oAuth2Client.setCredentials(req.body.access_token);
  listSubfoldersAndFiles(oAuth2Client, folderId, (result) => {
    res.json(result);
  });
});

module.exports = router;
