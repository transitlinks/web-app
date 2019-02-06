import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './CheckIn.css';
import { getGeolocation } from '../../actions/global';
import { saveCheckIn } from '../../actions/posts';
import { setProperty } from '../../actions/properties';
import { injectIntl } from 'react-intl';
import msg from './messages';

const formatCoords = (coords) => {
  const { latitude, longitude } = coords;
  return `${latitude}`.substring(0, 6) + '/' + `${longitude}`.substring(0, 6);
};

const getCheckIn = (geolocation) => {

  const { position } = geolocation;
  if (position) {
    const { coords: { latitude, longitude } } = position;
    return { latitude, longitude };
  }

  return null;

};

const CheckInView = ({ intl, geolocation, setProperty, getGeolocation, saveCheckIn }) => {

  let positionElem = null;
  if (geolocation) {
    if (geolocation.status === 'located') {
      const { position } = geolocation;
      positionElem = (
        <div>
          { formatCoords(position.coords) }
        </div>
      );
    } else if (geolocation.status === 'locating') {
      positionElem = (
        <div>
          Locating...
        </div>
      );
    } else if (geolocation.status === 'error') {
      positionElem = (
        <div>
          { geolocation.error }
        </div>
      );
    }
  }

	return (
	  <div className={s.root}>
      <div className={s.container}>
        <div className={s.placeSelector}>
          <div className={s.positionContainer}>
            <div className={s.positionButton} onClick={() => getGeolocation()}>
              <FontIcon className="material-icons" style={{ fontSize: '30px' }}>my_location</FontIcon>
            </div>
            <div className={s.positionSelector}>
              <div className={s.positionValue}>
                { positionElem }
              </div>
              <div className={s.editPositionButton} onClick={() => saveCheckIn({ checkIn: getCheckIn(geolocation) })}>
                <FontIcon className="material-icons" style={{ fontSize: '28px', color: '#2eb82e' }}>beenhere</FontIcon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

CheckInView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    geolocation: {
      status: state.global['geolocation.status'],
      position: state.global['geolocation.position'],
      error: state.global['geolocation.error']
    },
    savedCheckIn: state.posts.checkIn
  }), {
    setProperty,
    getGeolocation,
    saveCheckIn
  })(withStyles(s)(CheckInView))
);
