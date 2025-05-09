const { google } = require('googleapis');
const path = require('path');

const KEYFILE = path.join(__dirname, '../../scripts/salman-sustainability-re-41855-d9672818646f.json');

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

module.exports = drive;