import { getLog } from './log';
const log = getLog('passport');

import passport from 'passport';
import bcrypt from 'bcrypt-nodejs';
import { User, UserLogin, UserClaim, UserProfile } from '../data/models';
import {
	APP_URL, 
  FB_GRAPH_API,
  AUTH_FB_APPID, AUTH_FB_SECRET,
  GOOGLE_OAUTH_ID, GOOGLE_OAUTH_SECRET
} from '../config';

const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const getUser = async (email, photo, password) => {
  
  log.debug('getUser', `email=${email}`);
  
  let user = await User.findOne({ where: { email } });
  if (!user) {
    log.debug('getUser', 'create-user', `email=${email}`, `photo=${photo}`, `password=${password}`);
    const pwdHash = !(password && password.length > 0) ? null :
      bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    user = await User.create({
      email,
      photo,
      password: pwdHash
    });
  } else if (photo) {
    await User.update({ photo }, { where: { id: user.id } });
  }
  
  if (user) {
    
    log.debug('getUser', 'user-found', `user.uuid=${user.get('uuid')}`);
    
    if (password) {
      if (!bcrypt.compareSync(password, user.get('password'))) {
        throw new Error("Invalid password");
      }
    }

    return user.json();
  
  }

};

passport.serializeUser((user, done) => {
  log.debug('passport.serializeUser', `user.uuid=${user.uuid}`); 
  done(null, user.uuid); 
});
  
passport.deserializeUser((uuid, done) => {
  log.debug('deserialize-user', `uuid=${uuid}`); 
  User.findOne({ where: { uuid } })
  .then(user => done(null, user.json()));
});

passport.use('login-local', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
	},
	async (email, password, done) => {
		log.debug('local-auth', `email=${email} password=${password}`);
    if (email) {
      try {
			  const user = await getUser(email, null, password);
			  done(null, user);
      } catch (error) {
        done({ message: 'some error' });
      }
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
      const photo = `${FB_GRAPH_API}/${profile.id}/picture?type=large`;
      const user = await getUser(email, photo);
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
      let photo = null;
      if (profile.photos && profile.photos.length > 0) { 
        photo = profile.photos[0].value;
        if (photo.indexOf('?sz') != -1) {
          photo = photo.split('?')[0] + '?sz=250';
        }
      }
      const user = await getUser(email, photo);
      done(null, user);
    } else {
      done({ message: 'Invalid Google profile' });
    }

  }
));

export default passport;
