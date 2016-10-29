import { getLog } from './log';
const log = getLog('passport');

import passport from 'passport';
import { User, UserLogin, UserClaim, UserProfile } from '../data/models';
import {
	APP_URL, 
  AUTH_FB_APPID, AUTH_FB_SECRET,
  GOOGLE_OAUTH_ID, GOOGLE_OAUTH_SECRET
} from '../config';

const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const getUser = async (email) => {
  
  log.debug('getUser', `email=${email}`);
  
  let user = await User.findOne({ where: { email } });
  if (!user) {
    log.debug('getUser', 'create-user', `email=${email}`);
    user = await User.create({
      email
    });
  }
  
  if (user) {
    log.debug('getUser', 'user-found', `user.id=${user.get('id')} user.uuid=${user.get('uuid')}`);
    return user.toJSON();
  }

};

passport.serializeUser((user, done) => {
  log.debug('passport.serializeUser', `user.id=${user.id}`); 
  done(null, user.id); 
});
  
passport.deserializeUser((id, done) => {
  log.debug('deserialize-user', `id=${id}`); 
  User.findOne({ where: { id } })
  .then(user => done(null, user.toJSON()));
});

passport.use('login-local', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
	},
	async (email, password, done) => {
		log.debug('local-auth', `email=${email} password=${password}`);
    if (email) {
			const user = await getUser(email);
			done(null, user); 
    } else {
			done({ message: 'Invalid login credentials' });
		}
  }  
));

passport.use('login-facebook', new FacebookStrategy({
    clientID: AUTH_FB_APPID,
    clientSecret: AUTH_FB_SECRET,
    callbackURL: `${APP_URL}/login/fb/callback`,
    profileFields: [ 'id', 'emails', 'name', 'gender', 'age_range' ],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    log.debug('fb-auth', `fb-id=${profile.id}`);
    const emails = profile.emails;
    if (emails && emails.length > 0) {
      const email = emails[0].value;
      const user = await getUser(email);
      done(null, user);
    } else {
      done({ message: 'Invalid Facebook profile' });
    }

  }
));

passport.use('login-google', new GoogleStrategy({
    clientID: GOOGLE_OAUTH_ID,
    clientSecret: GOOGLE_OAUTH_SECRET,
    callbackURL: `${APP_URL}/login/google/callback`,
    profileFields: [ 'id', 'emails', 'name', 'username', 'gender', 'birthday' ],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    log.debug('google-auth', `google-id=${profile.id}`);
    const emails = profile.emails;
    if (emails && emails.length > 0) {
      const email = emails[0].value;
      const user = await getUser(email);
      done(null, user);
    } else {
      done({ message: 'Invalid Google profile' });
    }

  }
));

export default passport;
