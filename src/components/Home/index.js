import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Home.css';
import Add from '../EditCheckInItem';
import NewCheckIn from '../NewCheckIn';
import Feed from '../Feed';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

const HomeView = ({ intl, setProperty, feed, transportTypes, post, error }) => {

  const errorClasses = {
    'PrelaunchError': s.prelaunchError
  };

  const errorElems = (!error || !error.errors) ? [] : error.errors.map(err => {
    return (
      <div className={errorClasses[err.name] || s.defaultError}>
        <div>{ err.text }</div>
        <div className={s.okButton}>
          <RaisedButton label="OK" onClick={() => setProperty('posts.error', null)} />
        </div>
      </div>
    );
  });


  const getFiltersElem = (query) => {

    const { user, tags, locality } = query;

    let filterDisplay = null;
    let directionsUrl = null;

    if (user && tags) {
      filterDisplay = (
        <div className={s.userTagFilter}>
          <div className={s.userImage}>
            <img src={feed.userImage} />
          </div>
          <div className={s.filterInfo}>
            <div className={s.userName}>{feed.user}</div>
            <div className={s.tags}>#{tags}</div>
          </div>
        </div>
      );
      directionsUrl = '/links?tag=' + tags;
    } else if (user) {
      filterDisplay = (
        <div className={s.userFilter}>
          <div className={s.userImage}>
            <img src={feed.userImage} />
          </div>
          <div className={s.userInfo}>
            <div className={s.userInfoTitle}>
              Viewing check-ins by
            </div>
            <div className={s.userName}>{feed.user}</div>
          </div>
        </div>
      );
    } else if (locality) {
      filterDisplay = (
        <div className={s.localityFilter}>
          <div className={s.localityName}>{locality}</div>
        </div>
      );
      directionsUrl = '/links?locality=' + locality;
    } else if (tags) {
      filterDisplay = (
        <div className={s.tagFilter}>
          <div className={s.tagName}>#{tags}</div>
        </div>
      );
    }

    return (
      <div className={s.filtersContainer}>
        <div className={s.filtersDisplay}>{filterDisplay}</div>
        <div className={s.filtersReset}>
          {
            directionsUrl &&
              <Link to={directionsUrl}>
                <FontIcon className="material-icons" style={{ fontSize: '30px' }}>
                  directions
                </FontIcon>
              </Link>
          }
          <Link to="/">
            <FontIcon className="material-icons" style={{ fontSize: '30px' }}>
              clear
            </FontIcon>
          </Link>
        </div>
      </div>
    );

  };

	return (
    <div className={s.container}>
      <div>
        {
          feed.query ?
            getFiltersElem(feed.query) :
            <NewCheckIn />
        }
      </div>
      <div>
        <div className={s.errors}>
          {errorElems}
        </div>
        <Feed post={post} feed={feed} transportTypes={transportTypes} post={post}/>
      </div>
    </div>
  );

};

HomeView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    breakdownSelected: state.home.breakdownSelected,
    error: state.posts.error
  }), {
    setProperty
  })(withStyles(s)(HomeView))
);
