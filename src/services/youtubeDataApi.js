import fs from 'fs';
import readline from 'readline';
import googleApis from 'googleapis';
import googleAuth from 'google-auth-library';
import prettyBytes from 'pretty-bytes';
import postRepository from "../data/source/postRepository";

import { FILE_PATH } from '../config';

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = (FILE_PATH || path.join(__dirname, 'public'))
  + '/.credentials';
const TOKEN_PATH = TOKEN_DIR + '/youtube.json';

export const uploadVideo = async (entityUuid, mediaItemUuid, filePath) => {
    const auth = await authorize(await getAuth());
    return await insert(auth, entityUuid, mediaItemUuid, filePath);
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

const insert = (auth, entityUuid, mediaItemUuid, filePath) => {

  return new Promise((resolve, reject) => {

    const youtube = googleApis.youtube({
      version: 'v3',
      auth
    });

    const fileName = filePath.replace(/^.*[\\\/]/, '');

    let intervalId = 0;

    const fake = {
      insert: (file, callback) => {
        const request = { req: { connection: { _bytesDispatched: 0 } } };
        intervalId = setInterval(() => {
          request.req.connection._bytesDispatched += 1;
          if (request.req.connection._bytesDispatched > 10) {
            clearInterval(intervalId);
            callback({ blah: 'blah' }, { id: '321321312', snippet: { thumbnails: { medium: { url: 'https://kjhkjh.com/hhkj.jpg' } } } });
          }
        }, 1000);
        return request;
      }
    };

    //const req = fake.insert({
    const req = youtube.videos.insert({

      part: 'id,snippet,status',
      notifySubscribers: false,
      resource: {
        snippet: {
          title: `${fileName}`,
          description: `txlinks-${entityUuid}`
        },
        status: {
          privacyStatus: 'unlisted'
        }
      },
      media: {
        body: fs.createReadStream(filePath)
      }

    }, (err, data) => {

      if (err) {
        console.error('Youtube upload error: ', err);
        reject(err);
        return;
      }

      resolve(data);

    });

    const fileSize = fs.statSync(filePath).size;
    let uploadedBytes = 0;
    console.log("file size", filePath, fileSize);
    postRepository.saveMediaItem({ uuid: mediaItemUuid, fileSize: fileSize, uploadStatus: 'uploading' });

    const calcProgress = () => {

      const uploadedMoreBytes = req.req.connection._bytesDispatched > uploadedBytes;
      uploadedBytes = req.req.connection._bytesDispatched;

      let uploadedMBytes = uploadedBytes / 1000000;
      let progress = uploadedBytes > fileSize ? 100 : (uploadedBytes / fileSize) * 100;

        if (uploadedMoreBytes) {
          postRepository.saveMediaItem({ uuid: mediaItemUuid, uploadProgress: progress.toFixed(2) });
          console.log(uploadedMBytes.toFixed(2) + ' MBs (' + uploadedBytes + ' Bs) uploaded. ' + progress.toFixed(2) + '% completed.');
        }

        if (progress < 100) {
          setTimeout(calcProgress, 1000);
        } else {
          console.log('\nDone uploading, waiting for response...\n');
        }

    };

    setTimeout(calcProgress, 1000);

  });

};
