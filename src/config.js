/* eslint-disable max-len */
const env = process.env || {};

//export const AUTH_FB_APPID = 'jsdkdhkashdk';
//export const AUTH_FB_SECRET = 'jdhajdhkjahk';

export const {
  DEV_MODE,
  ADMINS,
  APP_ENV,
  APP_URL,
  STORAGE_PATH,
  MEDIA_PATH,
  MEDIA_URL,
  HTTP_PORT,
  HTTP_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_URL,
  GRAPHQL_URL,
  AUTH_JWT_SECRET,
  FB_GRAPH_API,
  AUTH_FB_APPID,
  AUTH_FB_SECRET,
  GOOGLE_OAUTH_ID,
  GOOGLE_OAUTH_SECRET,
  PLACES_API_URL,
  PLACES_API_KEY,
  MAPS_JS_API_KEY,
  LOG_LEVEL_NODE,
  LOG_LEVEL_BROWSER = 'ALL',
  GA_TRACKING_ID 
} = env;

// default locale is the first one
export const locales = ['en', 'fi'];
