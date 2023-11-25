const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const credentials = require('../gd.json');

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

router.post('/readDrive/:folderId', (req, res) => {
    if (req.body.access_token == null) return res.status(400).send('Token not found');
    
    const folderId = req.params.folderId;

    if (!folderId) {
        return res.status(400).send('Folder ID is required');
    }

    oAuth2Client.setCredentials(req.body.access_token);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    drive.files.list({
        q: `'${folderId}' in parents`,
        pageSize: 10,
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return res.status(400).send(err);
        }
        const files = response.data.files;
        if (files.length) {
            files.map((file) => {
            });
            const filesWithLinks = files.map((file) => ({
                name: file.name,
                id: file.id,
                webLink: `https://drive.google.com/file/d/${file.id}/view`,
            }));

            res.send(filesWithLinks);
        } else {
            console.log('No files found in the specified folder.');
            // res.status(400).send(err);
            res.send([])
        }
    });
});

module.exports = router;
