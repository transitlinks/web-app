import fs from 'fs';
import readline from 'readline';
import googleApis from 'googleapis';
import googleAuth from 'google-auth-library';
import prettyBytes from 'pretty-bytes';

import { FILE_PATH } from '../config';

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = (FILE_PATH || path.join(__dirname, 'public'))
  + '/.credentials';
const TOKEN_PATH = TOKEN_DIR + '/youtube.json';

export const uploadVideo = async (uuid, filePath) => {
    const auth = await authorize(await getAuth());
    return await insert(auth, uuid, filePath);
};

export const getVideos = async (id) => {
    const auth = await authorize(await getAuth());
    return await listAll(auth, id);
};

const getAuth = () => {

  return new Promise((resolve, reject) => {
    
    fs.readFile(TOKEN_DIR + '/youtube_client_secret.json', (err, content) => {

      if (err) {
        console.error('Error loading client secret file: ' + err);
        reject(err);
        return;
      }

      resolve(JSON.parse(content));

    });

  });

};

const authorize = async (credentials) => {
  
  return new Promise((resolve, reject) => {

    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        reject(err);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });

  });

};

const list = (auth, q, pageToken) => {

  return new Promise((resolve, reject) => {

    const service = googleApis.youtube('v3');
    
    const params = {
      auth: auth,
      part: 'snippet',
      channelId: 'UCU_-N-nyH4pgBPHbNUXnHeQ',
      maxResults: 5
    };
    
    if (q) params.q = q;
    if (pageToken) params.pageToken = pageToken;
    
    service.search.list(params, (err, response) => {

      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
        return;
      }

      resolve(response.items);

    });

  });

};

const listAll = async (auth, q) => {
  
  let videos = [];
  let response = await list(auth, q);
  videos = videos.concat(response.items);
  while (response.nextPageToken) {
    response = await list(auth, q, response.nextPageToken);
    videos = videos.concat(response.items); 
  }
  
  return videos;

};

const insert = (auth, uuid, filePath) => {
  
  return new Promise((resolve, reject) => {

    const youtube = googleApis.youtube({
      version: 'v3',
      auth
    });
  
    const fileName = filePath.replace(/^.*[\\\/]/, '');
    
    let intervalId = 0;
    
    const req = youtube.videos.insert({
      
      part: 'id,snippet,status',
      notifySubscribers: false,
      resource: {
        snippet: {
          title: `${fileName}`,
          description: `txlinks-${uuid}`
        },
        status: {
          privacyStatus: 'private'
        }
      },
      media: {
        body: fs.createReadStream(filePath)
      }

    }, (err, data) => {
      
      clearInterval(intervalId);

      if (err) {
        console.error('Youtube upload error: ', err);
        reject(err);
      }
      if (data) {
        resolve(data);
      }

    });
    
    /*
    const fileSize = fs.statSync(filePath).size;  
    //console.log("file size", filePath, fileSize); 
    intervalId = setInterval(() => {
      let uploadedBytes = req.req.connection._bytesDispatched;
      console.log("Uploaded bytes", uploadedBytes);
      let uploadedMBytes = uploadedBytes / 1000000;
      let progress = uploadedBytes > fileSize
        ? 100 : (uploadedBytes / fileSize) * 100;
      //process.stdout.clearLine();
      //process.stdout.cursorTo(0);
      //process.stdout.write(uploadedMBytes.toFixed(2) + ' MBs uploaded. ' +
      //  progress.toFixed(2) + '% completed.');
      console.log(uploadedMBytes.toFixed(2) + ' MBs uploaded. ' +
        progress.toFixed(2) + '% completed.');
      if (progress === 100) {
        console.log('\nDone uploading, waiting for response...\n');
        clearInterval(id);
      }
    }, 1000);
    */

  });

};
