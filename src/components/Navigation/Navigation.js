import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setAuth } from '../../actions/auth';
import { defineMessages, FormattedMessage } from 'react-intl';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';
import msg from './messages';

const Navigation = ({ setAuth, auth, className }) => {

  console.log("NAV AUTH", auth);

  const loginElem = auth.loggedIn ? (
    <a className={s.link} href="/logout">
      <FormattedMessage {...msg.logout} />
    </a>
  ) : (
    <Link className={s.link} to="/login">
      <FormattedMessage {...msg.login} />
    </Link>
  );

  return (
    <div className={cx(s.root, className)} role="navigation">
      <Link className={s.link} to="/link-instance">
        <FormattedMessage {...msg.newLink} />
      </Link>
      <Link className={s.link} to="/search">
        <FormattedMessage {...msg.search} />
      </Link>
      <Link className={s.link} to="/about">
        <FormattedMessage {...msg.about} />
      </Link>
      <span className={s.spacer}> | </span>
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
