
import { getLog } from '../core/log';
const log = getLog('services/vimeoDataApi');

import { Vimeo } from 'vimeo';
import { VIMEO_CLIENT_ID, VIMEO_CLIENT_SECRET, VIMEO_AUTH_TOKEN } from '../config';
import postRepository from '../data/source/postRepository';

export const uploadVideo = (filePath, mediaItemUuid) => {
  return new Promise((resolve, reject) => {
    const client = new Vimeo(VIMEO_CLIENT_ID, VIMEO_CLIENT_SECRET, VIMEO_AUTH_TOKEN);
    client.upload(
      filePath,
      async (uri) => {
        log.debug('vimeo-upload', 'success', `vimeo-uri=${uri}`);
        resolve({ url: uri });
      },
      (bytesUploaded, bytesTotal) => {
        const percentage = (bytesUploaded / bytesTotal * 100).toFixed(0);
        postRepository.saveMediaItem({ uuid: mediaItemUuid, uploadProgress: percentage });
        //log.debug('vimeo-upload', 'progress', bytesUploaded + 'B / ' + bytesTotal + 'B (' + percentage + '%)');
      },
      (error) => {
        log.error('vimeo-upload', 'error', error);
        reject(error);
      }
    );
  });
};

export const deleteVideo = (path) => {
  return new Promise((resolve, reject) => {
    const client = new Vimeo(VIMEO_CLIENT_ID, VIMEO_CLIENT_SECRET, VIMEO_AUTH_TOKEN);
    client.request({
      method: 'DELETE',
      path
    }, (error, body, statusCode) => {
      if (error) {
        log.error('vimeo-delete', 'error', 'status-code=' + statusCode, error);
        reject(error);
      } else {
        log.debug('vimeo-delete', 'success', `path=${path}`);
        resolve(path);
      }
    });
  });
};


