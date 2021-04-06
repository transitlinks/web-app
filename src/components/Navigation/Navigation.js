import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setAuth } from '../../actions/auth';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';
import msg from './messages';

const Navigation = ({ env, auth, savedProfile, className }) => {

  const user = savedProfile || auth.user;

  let loginElem = null;

  if (auth.loggedIn && user) {

    console.log('USER AVATAR', user.avatar, savedProfile);

    loginElem = (
      <div id="logout-link" style={{ cursor: 'pointer' }}>
        <div onClick={() => {
          window.location.href = '/account';
        }}>
          <div className={s.avatar}>
            <img src={user.avatar ? `${env.MEDIA_URL}${user.avatar}?${(new Date()).getTime()}` : user.photo} />
          </div>
        </div>
      </div>
    );
  } else {
    loginElem = (
      <div className={s.link} id="login-link" onClick={() => {
        window.location.href = '/login';
      }}>
        <FormattedMessage {...msg.login} />
      </div>
    );
  }

  return (
    <div className={cx(s.root, className)} role="navigation" style={{ cursor: 'pointer' }}>
      <div className={s.content}>
        {loginElem}
      </div>
    </div>
  );
};

Navigation.propTypes = {
  className: PropTypes.string,
};

export default connect(state => ({
  auth: state.auth.auth,
  env: state.env,
  savedProfile: state.profile.savedProfile
}), {
  setAuth
})(withStyles(s)(Navigation));
