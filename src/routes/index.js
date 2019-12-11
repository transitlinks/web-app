import { getLog } from '../core/log';
const log = getLog('routes');

import expressGraphQL from 'express-graphql';
import UniversalRouter from 'universal-router';
import createHistory from '../core/createHistory';
import configureStore from '../store/configureStore';
import { setRuntimeVariable } from '../actions/runtime';
import { setLocale } from '../actions/intl';

import React from 'react';
import ReactDOM from 'react-dom/server';
import Html from '../components/Html';
import Provide from '../components/Provide';
import App from '../components/App';

// Child routes
import home from './home';
import discover from './discover';
import links from './links';
import search from './search';
import link from './link';
import linkInstance from './linkInstance';
import checkIn from './checkIn';
import login from './login';
import account from './account';
import add from './add';
import content from './content';
import error from './error';

import { locales, MEDIA_URL, ADMINS, DEV_MODE } from '../config';

const routes = {

  path: '/',

  // keep in mind, routes are evaluated in order
  children: [
    home,
    discover,
    links,
    login,
    account,
    add,
    search,
    link,
    linkInstance,
    checkIn,
    // place new routes before...
    content,
    error,
  ],

  async action({ next, render, context }) {
    const component = await next();
    if (component === undefined) return component;
    return render(
      <App context={context}>{component}</App>
    );
  },

};

export const initEndpoints = (app) => {

	app.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
  });

	app.post('/login', (req, res, next) => {

    app.passport.authenticate('login-local', (err, user, info) => {
      if (err) {
        req.session.error = err;
        res.redirect('/login');
        return;
      } else {
        if (req.session.error) {
          delete req.session.error;
        }
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        req.session.newUser = user.isNew;
        res.redirect('/');
      });

    })(req, res, next);

  });

  app.get('/login/fb',
    app.passport.authenticate(
      'login-facebook',
      { scope: [ 'email', 'public_profile' ], session: false }
  ));

  app.get('/login/fb/callback',
    app.passport.authenticate('login-facebook', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect home.
      res.redirect('/');
  });

  app.get('/login/google',
    app.passport.authenticate(
      'login-google',
      { scope: [ 'email', 'profile' ], session: false }
  ));

  app.get('/login/google/callback',
    app.passport.authenticate('login-google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect home.
      res.redirect('/');
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.use('/graphql', expressGraphQL(req => {

    const authorization = req.get('Authorization');
    if (authorization && authorization.length > 5 && authorization.substring(0, 4) === 'mock') {
      req.user = {
        uuid: authorization.substring(5)
      };
    }

    return {
      schema: app.schema,
      graphiql: true,
      rootValue: { request: req },
      formatError: error => {
        log.debug("gql error", error);
        const { name, text, statusCode } = error.extensions;
        return {
          name, text, statusCode,
          message: error.message,
          locations: error.locations,
          stack: error.stack
        }
      },
      pretty: process.env.NODE_ENV !== 'production',
    };

  }));

  app.get('/search', async (req, res, next) => {
    next();
  });

  app.get('*', async (req, res, next) => {

    if (req.path.indexOf('/assets') !== -1) {
      return next();
    }

    log.debug('user auth', req.user, req.session, req.isAuthenticated());
    const auth = req.isAuthenticated() ? {
			loggedIn: true,
			user: req.user
		} : {
			loggedIn: false
		};

		const history = createHistory(req.url);
    // let currentLocation = history.getCurrentLocation();
    let sent = false;
    const removeHistoryListener = history.listen(location => {
      const newUrl = `${location.pathname}${location.search}`;
      if (req.originalUrl !== newUrl) {
        // console.log(`R ${req.originalUrl} -> ${newUrl}`); // eslint-disable-line no-console
        if (!sent) {
          res.redirect(303, newUrl);
          sent = true;
          next();
        } else {
          console.error(`${req.path}: Already sent!`); // eslint-disable-line no-console
        }
      }
    });

    const admins = ADMINS.split(',');
    const isAdmin = auth.loggedIn && admins.indexOf(auth.user.email) !== -1;
    const env = {
      MEDIA_URL,
      isAdmin,
      offline: DEV_MODE === 'offline'
    };

    try {

      const store = configureStore({
        auth: { auth },
        env
      }, {
        cookie: req.headers.cookie,
        history,
      });

      store.dispatch(setRuntimeVariable({
        name: 'initialNow',
        value: Date.now(),
      }));

      store.dispatch(setRuntimeVariable({
        name: 'reqError',
        value: req.session.error
      }));

      store.dispatch(setRuntimeVariable({
        name: 'userAgent',
        value: req.headers['user-agent']
      }));

      let css = new Set();
      let statusCode = 200;
      const locale = req.language;
      const data = {
        lang: locale,
        title: '',
        description: '',
        style: '',
        script: app.assets.main.js,
        children: '',
      };

      store.dispatch(setRuntimeVariable({
        name: 'availableLocales',
        value: locales
      }));

      await store.dispatch(setLocale({
        locale
      }));

      await UniversalRouter.resolve(routes, {
        path: req.path,
        query: req.query,
        context: {
          store,
          createHref: history.createHref,
          insertCss: (...styles) => {
            styles.forEach(style => css.add(style._getCss())); // eslint-disable-line no-underscore-dangle, max-len
          },
          setTitle: value => (data.title = value),
          setMeta: (key, value) => (data[key] = value),
        },
        render(component, status = 200) {
          css = new Set();
          statusCode = status;

          // Fire all componentWill... hooks
          data.children = ReactDOM.renderToString(<Provide store={store}>{component}</Provide>);

          // If you have async actions, wait for store when stabilizes here.
          // This may be asynchronous loop if you have complicated structure.
          // Then render again

          // If store has no changes, you do not need render again!
          // data.children = ReactDOM.renderToString(<Provide store={store}>{component}</Provide>);

          // It is important to have rendered output and state in sync,
          // otherwise React will write error to console when mounting on client
          data.state = store.getState();
          data.style = [...css].join('');
          return true;
        },
      });

      if (!sent) {
        const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
        res.status(statusCode);
        res.send(`<!doctype html>${html}`);
      }

    } catch (err) {
      next(err);
    } finally {
      removeHistoryListener();
    }

  });

};

export default routes;
