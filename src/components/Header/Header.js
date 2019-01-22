import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import cx from 'classnames';
import Link from '../Link';
import Navigation from '../Navigation';
import LanguageSwitcher from '../LanguageSwitcher';
import FunctionBar from '../FunctionBar';
import logoUrl from './logo-small.png';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';

import { FormattedMessage, injectIntl } from 'react-intl';
import msg from './messages';

function Header() {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.logo}>
          <Link className={s.brand} to="/">
            <FontIcon className="material-icons" style={{ fontSize: '40px' }}>public</FontIcon>
          </Link>
          <div className={s.functionBar}>
            <FunctionBar />
          </div>
        </div>
        <div className={s.navigation}>
          <Navigation className={s.nav} />
        </div>
      </div>
    </div>
  );
}

export default injectIntl(withStyles(s)(Header));
