import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setAuth } from '../../actions/auth';
import { defineMessages, FormattedMessage } from 'react-intl';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Avatar from 'material-ui/Avatar';
import Link from '../Link';
import msg from './messages';

const Navigation = ({ setAuth, auth, className }) => {
  
  const loginElem = auth.loggedIn ? (
    <div id="logout-link">
      <Link to="/account">
        <Avatar src={auth.user.photo} size={40} /> 
      </Link>
      <a className={s.link} href="/logout">
        <FormattedMessage {...msg.logout} />
      </a>
    </div>
  ) : (
    <Link className={s.link} id="login-link" to="/login">
      <FormattedMessage {...msg.login} />
    </Link>
  );

  return (
    <div className={cx(s.root, className)} role="navigation">
      {loginElem}
    </div>
  );
};

Navigation.propTypes = {
  className: PropTypes.string,
};

export default connect(state => ({
  auth: state.auth.auth
}), {
  setAuth
})(withStyles(s)(Navigation));
