import React, { PropTypes } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';

const messages = defineMessages({
  search: {
    id: 'navigation.search',
    defaultMessage: 'Search',
    description: 'Search link'
  },
  newLink: {
    id: 'navigation.newLink',
    defaultMessage: 'Create',
    description: 'New link link'
  },
  about: {
    id: 'navigation.about',
    defaultMessage: 'About',
    description: 'About link in header',
  },
  login: {
    id: 'navigation.login',
    defaultMessage: 'Log in',
    description: 'Log in link in header',
  }
});

function Navigation({ className }) {
  return (
    <div className={cx(s.root, className)} role="navigation">
      <Link className={s.link} to="/link-instance">
        <FormattedMessage {...messages.newLink} />
      </Link>
      <Link className={s.link} to="/search">
        <FormattedMessage {...messages.search} />
      </Link>
      <Link className={s.link} to="/about">
        <FormattedMessage {...messages.about} />
      </Link>
      <span className={s.spacer}> | </span>
      <Link className={s.link} to="/login">
        <FormattedMessage {...messages.login} />
      </Link>
    </div>
  );
}

Navigation.propTypes = {
  className: PropTypes.string,
};

export default withStyles(s)(Navigation);
