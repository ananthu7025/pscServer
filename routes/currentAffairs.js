const express = require('express');
const router = express.Router();
const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');
const { OAuth2Client } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json';
const credentialsPath = './gd.json';

router.get('/files', (req, res) => {
    const { folderId } = req.query;
    if (!folderId) {
      return res.status(400).json({ error: 'Missing folderId parameter' });
    }
  
    fs.readFile(credentialsPath, 'utf8', (err, content) => {
      if (err) return res.status(500).json({ error: 'Error reading client secret file' });
  
      try {
        const credentials = JSON.parse(content);
        authorize(credentials, (oAuth2Client) => {
          listFiles(oAuth2Client, folderId, (files) => {
            res.json({ files });
          });
        });
      } catch (parseError) {
        console.error('Error parsing client secret file:', parseError);
        res.status(500).json({ error: 'Error parsing client secret file' });
      }
    });
  });
  

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
  
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      console.log('No token found, getting a new one...');
      return getAccessToken(oAuth2Client, callback);
    }

    try {
      const parsedToken = JSON.parse(token);
      if (isTokenExpired(parsedToken)) {
        console.log('Token expired, refreshing...');
        return refreshToken(oAuth2Client, parsedToken, callback);
      }

      oAuth2Client.setCredentials(parsedToken);
      callback(oAuth2Client);
    } catch (parseError) {
      console.error('Error parsing token file:', parseError);
      getAccessToken(oAuth2Client, callback);
    }
  });
}

function isTokenExpired(token) {
  // Check if the token expiration time is in the past
  return Date.now() >= token.expiry_date;
}

function refreshToken(oAuth2Client, oldToken, callback) {
  console.log('Refreshing token...');
  console.log('Refreshing token with refresh token:', oldToken.refresh_token);
console.log('Token expiration time:', new Date(parsedToken.expiry_date).toLocaleString());

  oAuth2Client.refreshToken(oldToken.refresh_token, (err, newToken) => {
    if (err) {
      console.error('Error refreshing token:', err);
      return getAccessToken(oAuth2Client, callback);
    }

    oAuth2Client.setCredentials(newToken);
    fs.writeFile(TOKEN_PATH, JSON.stringify(newToken), (err) => {
      if (err) {
        console.error('Error storing refreshed token:', err);
        return getAccessToken(oAuth2Client, callback);
      }

      console.log('Token refreshed and stored to', TOKEN_PATH);
      callback(oAuth2Client);
    });
  });
}



function listFiles(oAuth2Client, folderId, callback) {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  drive.files.list({
    q: `'${folderId}' in parents`,
    pageSize: 50,
    fields: 'nextPageToken, files(id, name, webViewLink)',
  }, (err, res) => {
    if (err) {
      console.error('The API returned an error:', err);
      return callback([]);
    }
    const files = res.data.files || [];
    callback(files);
  });
}

module.exports = router;
