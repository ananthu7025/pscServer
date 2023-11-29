const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require("fs");
const formidable = require('formidable');
const credentials = require('./gd.json');

const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPE = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file']

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/getAuthURL', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
    });
    return res.send(authUrl);
});

app.post('/getToken', (req, res) => {
    if (req.body.code == null) return res.status(400).send('Invalid Request');
    code = decodeURIComponent(req.body.code); 

    oAuth2Client.getToken(code, (err, token) => {
        if (err) {
            console.error('Error retrieving access token', err);
            return res.status(400).send('Error retrieving access token');
        }
        res.send(token);
    });
});



app.post('/readDrive/:folderId', (req, res) => {
    if (req.body.access_token == null) return res.status(400).send('Token not found');
    
    const folderId = req.params.folderId;

    if (!folderId) {
        return res.status(400).send('Folder ID is required');
    }

    oAuth2Client.setCredentials(req.body.access_token);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    drive.files.list({
        q: `'${folderId}' in parents`, // Set the folder ID as a parent
        pageSize: 10,
    }, (err, response) => {
        if (err) {
            // console.log('The API returned an error: ' + err);
            return res.status(400).send(err);
        }
        const files = response.data.files;
        if (files.length) {
            files.map((file) => {
            });

            // Add a web link to each file
            const filesWithLinks = files.map((file) => ({
                name: file.name,
                id: file.id,
                webLink: `https://drive.google.com/file/d/${file.id}/view`,
            }));

            res.send(filesWithLinks);
        } else {
            // console.log('No files found in the specified folder.');
            res.send([]);
        }
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Started ${PORT}`));