import { getLog } from './log';
const log = getLog('passport');

import passport from 'passport';
import { User, UserLogin, UserClaim, UserProfile } from '../data/models';
import { AUTH_FB_APPID, AUTH_FB_SECRET } from '../config';

const FacebookStrategy = require("passport-facebook").Strategy;

passport.serializeUser((user, done) => { 
  done(null, user.id); 
});
  
passport.deserializeUser((id, done) => { 
  done(null, { id, email: 'e@mail' });
});

passport.use('login-facebook', new FacebookStrategy({
    clientID: AUTH_FB_APPID,
    clientSecret: AUTH_FB_SECRET,
    callbackURL: `/login/fb/callback`,
    profileFields: [ 'id', 'emails', 'name', 'gender', 'age_range' ],
    passReqToCallback: true
  },
  (req, accessToken, refreshToken, profile, done) => {
    log.debug('fb profile', profile);
    //done({ message: 'noauth' }, null);
    done(null, { id: profile.id, email: profile.emails[0].value });
  }
));

export default passport;
