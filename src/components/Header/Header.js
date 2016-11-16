import React from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import cx from 'classnames';
import Link from '../Link';
import Navigation from '../Navigation';
import LanguageSwitcher from '../LanguageSwitcher';
import logoUrl from './logo-small.png';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';

const messages = defineMessages({
  brand: {
    id: 'header.brand',
    defaultMessage: 'Your Company Brand',
    description: 'Brand name displayed in header',
  },
});

function Header() {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.logo}>
          <Link className={s.brand} to="/">
            <FontIcon className="material-icons">shuffle</FontIcon>
            <span className={s.brandTxt}>
              <FormattedMessage {...messages.brand} />
            </span>
          </Link>
        </div>
        <div className={s.navigation}>
          <Navigation className={s.nav} />
        </div>
      </div>
      <div className={s.languages}>
        <LanguageSwitcher />
      </div>
    </div>
  );
}

export default injectIntl(withStyles(s)(Header));
