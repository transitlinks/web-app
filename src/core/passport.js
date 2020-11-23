import { getLog } from './log';
const log = getLog('passport');

import fs from 'fs';
import { https } from 'follow-redirects';
import path from 'path';
import passport from 'passport';
import jdenticon from 'jdenticon';
import { login } from './auth';
import { User, UserLogin, UserClaim, UserProfile } from '../data/models';
import {
  APP_URL,
  FB_GRAPH_API,
  AUTH_FB_APPID, AUTH_FB_SECRET,
  GOOGLE_OAUTH_ID, GOOGLE_OAUTH_SECRET, MEDIA_PATH, MEDIA_URL
} from '../config';
import { userRepository } from '../data/source';

const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const downloadPhoto = async (photoUrl, userUuid) => {

  const usersPath = path.join((MEDIA_PATH || path.join(__dirname, 'public')), 'users');
  const userMediaPath = path.join(usersPath, userUuid);
  console.log('USER MEDIA PATH', usersPath, userMediaPath);
  if (!fs.existsSync(userMediaPath)) {
    fs.mkdirSync(userMediaPath);
  }

  const mediaFilePath = path.join(userMediaPath, 'photo.jpg');

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(mediaFilePath);
    console.log('GET:', photoUrl);
    https.get(photoUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);  // close() is async, call cb after close completes.
      });
    }).on('error', (err) => { // Handle errors
      fs.unlink(mediaFilePath); // Delete the file async. (But we don't check the result)
      reject(err.message);
    });
  });

};

const getAvatarPaths = (user, extension) => {

  const basePath = MEDIA_PATH || path.join(__dirname, 'public');
  const userPath = `/users/${user.uuid}`;
  const avatarSourceFilePath = `${userPath}/avatar-source.${extension}`;
  const avatarFilePath = `${userPath}/avatar.${extension}`;
  if (!fs.existsSync(path.join(basePath, userPath))) {
    fs.mkdirSync(path.join(basePath, userPath));
  }
  return {
    basePath,
    avatarSourceFilePath,
    avatarFilePath
  };

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
        const user = await login({ email, password });
        const png = jdenticon.toPng(user.uuid, 74);
        const { basePath, avatarSourceFilePath, avatarFilePath } = getAvatarPaths(user, 'png');
        fs.writeFileSync(path.join(basePath, avatarSourceFilePath), png);
        fs.writeFileSync(path.join(basePath, avatarFilePath), png);
        await userRepository.update(user.uuid, {
          photo: `${MEDIA_URL}/${user.uuid}.png`,
          avatarSource: avatarSourceFilePath,
          avatar: avatarFilePath
        });
        done(null, user);
      } catch (err) {
        done({ message: err.message });
      }
    } else {
			done({ message: 'invalid-login-credentials' });
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
    let firstName = null;
    let lastName = null;
    if (profile.name) {
      firstName = profile.name.givenName;
      lastName = profile.name.familyName;
    }
    if (emails && emails.length > 0) {
      const email = emails[0].value;
      const photo = `${FB_GRAPH_API}/${profile.id}/picture?type=large`;
      try {
        const user = await login({ email, firstName, lastName, username: `${firstName} ${lastName}`, photo });
        await downloadPhoto(photo, user.uuid);
        if (!user.avatar) {
          await userRepository.update(user.uuid, { avatar: `/users/${user.uuid}/photo.jpg`, avatarSource: `/users/${user.uuid}/photo.jpg` });
        }
        done(null, user);
      } catch (err) {
        done({ message: err.message });
      }
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
    console.log('got google profile', profile);
    log.debug('google-auth', `google-id=${profile.id}`);
    const emails = profile.emails;
    if (emails && emails.length > 0) {
      const email = emails[0].value;
      let photo = null;
      let firstName = null;
      let lastName = null;
      if (profile.name) {
        firstName = profile.name.givenName;
        lastName = profile.name.familyName;
      }
      if (profile.photos && profile.photos.length > 0) {
        photo = profile.photos[0].value;
        if (photo.indexOf('?sz') != -1) {
          photo = photo.split('?')[0] + '?sz=250';
        }
      }
      try {
        const user = await login({ email, firstName, lastName, username: `${firstName} ${lastName}`, photo });
        await downloadPhoto(photo, user.uuid);
        if (!user.avatar) {
          await userRepository.update(user.uuid, { avatar: `/users/${user.uuid}/photo.jpg`, avatarSource: `/users/${user.uuid}/photo.jpg` });
        }
        done(null, user);
      } catch (err) {
        done({ message: err.message });
      }
    } else {
      done({ message: 'Invalid Google profile' });
    }

  }
));

export default passport;
