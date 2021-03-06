import { getLog } from './core/log';
const log = getLog('server');

import 'babel-polyfill';
import './serverIntlPolyfill';
import path from 'path';
import http from 'http';
import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import expressSession from 'express-session';
import pgSessionStore from 'connect-pg-simple';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import React from 'react';
import ReactDOM from 'react-dom/server';
import Html from './components/Html';
import { ErrorPage } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import PrettyError from 'pretty-error';
import passport from './core/passport';
import models from './data/models';
import schema from './data/schema';
import { loadFixtures } from './data/sequelize';
import routes from './routes';
import { initEndpoints } from './routes';

import { APP_ENV, HTTP_HOST, HTTP_PORT, STORAGE_PATH, locales } from './config';

import assets from './assets'; // eslint-disable-line import/no-unresolved

//import { HTTP_HOST, HTTP_PORT, locales } from './config';

if (process.env.TEST_ENV === 'test' && APP_ENV !== 'test') {
  console.log("Not allowed to run in test mode with wrong environment settings");
  console.log("TEST_ENV", process.env.TEST_ENV);
  console.log("APP_ENV", APP_ENV);
  process.exit(1);
}

const app = express();
app.schema = schema;
app.assets = assets;

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';
//global.navigator.userAgent = 'all';
//global.navigator = { navigator: 'all' };

// Register Node.js middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(requestLanguage({
  languages: locales,
  queryName: 'lang',
  cookie: {
    name: 'lang',
    options: {
      path: '/',
      maxAge: 3650 * 24 * 3600 * 1000, // 10 years in miliseconds
    },
    url: '/lang/{language}',
  },
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));

const instanceMediaPath = STORAGE_PATH || path.join(__dirname, 'public');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, instanceMediaPath)
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
app.use(multer({ storage }).single('file'));

// Authentication
/*
app.use(expressJwt({
  secret: auth.jwt.secret,
  credentialsRequired: false,
  getToken: req => req.cookies.id_token,
}));
*/

const poolSettings = {
  max: 10,
  connectionString: process.env.DB_URL
};

if (APP_ENV === 'stage') {
  poolSettings.ssl = {
    rejectUnauthorized: false
  };
}
const pool = new Pool(poolSettings);
const pgSession = pgSessionStore(expressSession);
app.use(expressSession({
  store: new pgSession({
    pool
  }),
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.passport = passport;

initEndpoints(app);

// Error handling
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars

  log.error(pe.render(err)); // eslint-disable-line no-console

  const statusCode = err.status || 500;
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      style={errorPageStyle._getCss()} // eslint-disable-line no-underscore-dangle
    >
      {ReactDOM.renderToString(<ErrorPage error={err} />)}
    </Html>
  );
  res.status(statusCode);
  res.send(`<!doctype html>${html}`);
});

const force = process.env.TEST_ENV === 'test';
// Launch the server
/* eslint-disable no-console */
models.sync({ force: false, logging: console.log }).catch(err => console.error(err.stack)).then(() => {

	loadFixtures();
  app.listen(HTTP_PORT, () => {
    log.info(`The server is running at http://${HTTP_HOST}:${HTTP_PORT}/`);
  });

});
/* eslint-enable no-console */
