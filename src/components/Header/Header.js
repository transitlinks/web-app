import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../Link';
import Navigation from '../Navigation';
import FontIcon from 'material-ui/FontIcon';

import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { saveTripCoord } from '../../actions/trips';

function Header() {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.logo}>
          <Link className={s.brand} to="/">
            <FontIcon className="material-icons" style={{ fontSize: '40px' }}>public</FontIcon>
          </Link>
          <div className={s.functionBar}>
            <Link className={s.brand} to="/discover">
              <FontIcon className="material-icons" style={{ fontSize: '40px' }}>explore</FontIcon>
            </Link>
          </div>
          <div className={s.functionBar}>
            <Link className={s.brand} to="/links">
              <FontIcon className="material-icons" style={{ fontSize: '40px' }}>directions</FontIcon>
            </Link>
          </div>
          <div className={s.logoBar}>
            <div className={s.logoBarText}>
              <div className={s.logoBarName}>Transitlinks.net</div>
              <div className={s.logoBarCaption}>SOCIAL WORLD MAP</div>
            </div>
          </div>
        </div>
        <div className={s.navigation}>
          <Navigation className={s.nav} />
        </div>
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
  }), {
    setProperty, saveTripCoord
  })(withStyles(s)(Header))
);
