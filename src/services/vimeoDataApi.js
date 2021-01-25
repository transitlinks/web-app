
import { getLog } from '../core/log';
const log = getLog('services/vimeoDataApi');

import { Vimeo } from 'vimeo';
import { VIMEO_CLIENT_ID, VIMEO_CLIENT_SECRET, VIMEO_AUTH_TOKEN } from '../config';

export const uploadVideo = (filePath) => {
  return new Promise((resolve, reject) => {
    const client = new Vimeo(VIMEO_CLIENT_ID, VIMEO_CLIENT_SECRET, VIMEO_AUTH_TOKEN);
    client.upload(
      filePath,
      async (uri) => {
        log.debug('vimeo-upload', 'success', `vimeo-uri=${uri}`);
        resolve({ url: uri });
      },
      (bytesUploaded, bytesTotal) => {
        const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
        log.debug('vimeo-upload', 'progress', bytesUploaded + 'B / ' + bytesTotal + 'B (' + percentage + '%)');
      },
      (error) => {
        log.error('vimeo-upload', 'error', error);
        reject(error);
      }
    );
  });
};
