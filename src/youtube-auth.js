import fs from 'fs';
import readline from 'readline';
import googleApis from 'googleapis';
import googleAuth from 'google-auth-library';

import { FILE_PATH } from './config';

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.upload'
];

const TOKEN_DIR = (FILE_PATH || path.join(__dirname, 'public'))
  + '/.credentials';
const TOKEN_PATH = TOKEN_DIR + '/youtube.json';

// Load client secrets from a local file.
fs.readFile(TOKEN_DIR + '/youtube_client_secret.json', (err, content) => {

  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content));

});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (credentials) => {

  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client);
    } else {
      console.log("Already authorized");
    }
  });

};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
const getNewToken = (oauth2Client, callback) => {

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Authorize this app by visiting this url: ', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      //callback(oauth2Client);
    });
  });

};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
const storeToken = (token) => {

  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }

  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);

};
