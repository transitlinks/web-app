import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../Link';
import Navigation from '../Navigation';
import FontIcon from 'material-ui/FontIcon';
import logoSquare from './logo-square.png';

import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route';

function Header({ navigate }) {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.navigation}>
          <div className={s.logoBar} onClick={() => {
            navigate({ pathname: '/' });
          }}>
            <div className={s.logoBarText}>
              <div className={s.logoBarName}>Transitlinks.net</div>
              <div className={s.logoBarCaption}>SOCIAL WORLD MAP</div>
            </div>
          </div>
          <div className={s.logo}>
            <Link to="/">
              <img src={logoSquare} width={32} height={32} />
            </Link>
          </div>
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
    navigate
  })(withStyles(s)(Header))
);
