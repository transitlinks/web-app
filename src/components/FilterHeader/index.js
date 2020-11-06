import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FilterHeader.css';
import Link from '../Link';

import { injectIntl } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';
import { getNavigationQuery } from '../utils';

export const renderRouteLabel = (from, to) => {
  return (
    <div className={s.filterLabel}>
      <div className={s.route}>{ from } - { to }</div>
    </div>
  )
};

export const renderTagLabel = (tag, user) => {

  if (user) {
    return (
      <div className={s.userTagFilter}>
        <div className={s.userImage}>
          <img src={user.userImage} />
        </div>
        <div className={s.filterInfo}>
          <div className={s.userName}>{user.userName}</div>
          <div className={s.tags}>#{tag}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.tagFilter}>
      <div className={s.tagName}>#{tag}</div>
    </div>
  );

};

export const renderTripLabel = (tripName, user) => {

  return (
    <div className={s.userTagFilter}>
      <div className={s.userImage}>
        <img src={user.userImage} />
      </div>
      <div className={s.filterInfo}>
        <div className={s.userName}>{user.userName}</div>
        <div className={s.trip}>{tripName}</div>
      </div>
    </div>
  );

};

export const renderLinkedLocalityLabel = (locality, linkedLocality, reverseUrl) => {
  return (
    <div className={s.linksListHeader}>
      <div className={s.locality}>{ locality }</div>
      <div className={s.linkedLocality}>
        <Link to={reverseUrl}>
          { linkedLocality }
        </Link>
      </div>
    </div>
  );
};

export const renderLocalityLabel = (locality) => {
  return (
    <div className={s.linksListHeader}>
      <div className={s.image}>
        <FontIcon className="material-icons" style={{ fontSize: '28px' }}>
          place
        </FontIcon>
      </div>
      <div className={s.label}>{locality}</div>
    </div>
  );
};

export const renderUserLabel = (user) => {
  return (
    <div className={s.userFilter}>
      <div className={s.userImage}>
        <img src={user.userImage} />
      </div>
      <div className={s.userInfo}>
        <div className={s.userInfoTitle}>
          Viewing check-ins by
        </div>
        <div className={s.userName}>{user.userImage}</div>
      </div>
    </div>
  );
};

const FilterHeader = ({ icon, user, tag, locality, linkedLocality, label, clearUrl, getUrl }) => {

  let directionsUrl = null;

  return (
    <div className={s.container}>
      <div className={s.filtersDisplay}>{label}</div>
      <div className={s.filtersReset}>
        {
          getUrl &&
            <Link to={getUrl()}>
              <FontIcon className="material-icons" style={{ fontSize: '30px' }}>
                {icon}
              </FontIcon>
            </Link>
        }
        <Link to={clearUrl || '/'}>
          <FontIcon className="material-icons" style={{ fontSize: '30px' }}>
            clear
          </FontIcon>
        </Link>
      </div>
    </div>
  );

};

FilterHeader.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(FilterHeader))
);
