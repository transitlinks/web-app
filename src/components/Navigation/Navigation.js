import React, { PropTypes } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';
import msg from './messages';

function Navigation({ className }) {
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
      <Link className={s.link} to="/login">
        <FormattedMessage {...msg.login} />
      </Link>
    </div>
  );
}

Navigation.propTypes = {
  className: PropTypes.string,
};

export default withStyles(s)(Navigation);
