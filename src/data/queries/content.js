import { getLog } from '../../core/log';
const log = getLog('data/queries/content');

import { join } from 'path';
import files from '../source/files';
import fm from 'front-matter';
import htmlFm from 'html-frontmatter';
import MarkdownIt from 'markdown-it';

import {
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import ContentType from '../types/ContentType';

const md = new MarkdownIt();

// A folder with Markdown/HTML content pages
const CONTENT_DIR = './content';

// Extract 'front matter' metadata and generate HTML
const parseContent = (path, fileContent, extension) => {
  
  let fmContent, htmlContent;
  switch (extension) {
    case '.md':
      fmContent = fm(fileContent);
      htmlContent = md.render(fmContent.body);
      break;
    case '.html':
      fmContent = { attributes: htmlFm(fileContent) };
      htmlContent = fileContent;
      break;
    default:
      return null;
  }
  return Object.assign({ path, content: htmlContent }, fmContent.attributes);
};


const resolveExtension = async (path, extension) => {

  let fileNameBase = join(CONTENT_DIR, `${path === '/' ? '/index' : path}`);
  let ext = extension;
  if (!ext.startsWith('.')) {
    ext = `.${extension}`;
  }

  let fileName = fileNameBase + ext;

  if (!(await files.fileExists(fileName))) {
    fileNameBase = join(CONTENT_DIR, `${path}/index`);
    fileName = fileNameBase + ext;
  }
  
  if (!(await files.fileExists(fileName))) {
    return { success: false };
  }

  return { success: true, fileName };

};

const resolveFileName = async (path) => {
  
  const extensions = [ '.md', '.html' ];

  for (const extension of extensions) {
    const maybeFileName = await resolveExtension(path, extension);
    if (maybeFileName.success) {
      return { success: true, fileName: maybeFileName.fileName, extension };
    }
  }
  
  const maybeFileName = await resolveExtension('not-found', '.html');
  if (maybeFileName.success) {
    return { success: true, fileName: maybeFileName.fileName, extension: '.html' };
  }

  return { success: false, fileName: null, extension: null };

};

const content = {

  type: ContentType,
  args: {
    path: { type: new NonNull(StringType) },
  },

  async resolve({ request }, { path }) {
    
    const { success, fileName, extension } = await resolveFileName(path);
    
    if (!success) {
      throw new Error(`Requested content not found: ${path}`);
    }

    const source = await files.readFile(fileName);
    return parseContent(path, source, extension);
  
  }

};

export default content;
