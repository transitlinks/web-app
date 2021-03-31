import Promise from 'bluebird';
import fetch, { Request, Headers, Response } from 'node-fetch';
import { HTTP_HOST, HTTP_PORT } from '../../config';

fetch.Promise = Promise;
Response.Promise = Promise;

function localUrl(url) {

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `http://${HTTP_HOST}:${HTTP_PORT}${url}`;

}

const localFetch = async (url, options) => {
  const response = await fetch(localUrl(url), options);
  const contentType = response.headers.get('content-type');
  let body = {};
  if (contentType.indexOf('json') != -1) {
    body = response.json();
  }
  return Object.assign(body, { statusCode: response.status });
}

export { localFetch as default, Request, Headers, Response };
