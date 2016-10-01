import { getLog } from '../../core/log';
const log = getLog('data/source/files');

import fs from 'fs';
import { join } from 'path';
import Promise from 'bluebird';

const fullPath = (path) => {
  return join(__dirname, path);
};

const asyncRead = Promise.promisify(fs.readFile);

export default {
  
  readFile: async (filename) => {
    return await asyncRead(fullPath(filename), { encoding: 'utf8' });
  },
    
  fileExists: (filename) => {
    return new Promise(resolve => {
      fs.exists(fullPath(filename), resolve);
    });
  }

};
