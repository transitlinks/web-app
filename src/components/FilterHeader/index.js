import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FilterHeader.css';
import Link from '../Link';

import { injectIntl } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';

const FilterHeader = ({ icon, user, tag, locality, label, clearUrl, getUrl }) => {

  let filterDisplay = null;
  let directionsUrl = null;

  if (user && tag) {
    filterDisplay = (
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
    directionsUrl = '/links?tag=' + tag + '&user=' + user.uuid + '&view=map';
  } else if (user) {
    filterDisplay = (
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
  } else if (locality) {
    filterDisplay = (
      <div className={s.localityFilter}>
        {
          label ||
            <div>
              <div className={s.localityImage}>
                <FontIcon className="material-icons" style={{ fontSize: '28px' }}>
                  place
                </FontIcon>
              </div>
              <div className={s.localityName}>{locality}</div>
            </div>
        }
      </div>
    );
    directionsUrl = '/links?locality=' + locality + '&view=map';
  } else if (tag) {
    filterDisplay = (
      <div className={s.tagFilter}>
        <div className={s.tagName}>#{tag}</div>
      </div>
    );
    directionsUrl = '/links?tag=' + tag + '&view=map';
  }

  if (getUrl) directionsUrl = getUrl();

  return (
    <div className={s.container}>
      <div className={s.filtersDisplay}>{filterDisplay}</div>
      <div className={s.filtersReset}>
        {
          directionsUrl &&
          <Link to={directionsUrl}>
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
