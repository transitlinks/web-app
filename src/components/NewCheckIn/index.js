import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import AddressAutocomplete from './AddressAutocomplete';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckIn.css';
import { getGeolocation } from '../../actions/global';
import { saveCheckIn } from '../../actions/checkIns';
import { setProperty } from '../../actions/properties';
import { saveTripCoord } from '../../actions/trips';
import { getClientId } from '../../core/utils';
import { injectIntl } from 'react-intl';
import { isMobile } from '../utils';

const createCheckIn = (geolocation, selectedLocation) => {

  if (!geolocation) return null;

  const { position } = geolocation;
  const locationValues = selectedLocation ? {
    latitude: selectedLocation.lat,
    longitude: selectedLocation.lng,
    placeId: selectedLocation.placeId,
    formattedAddress: selectedLocation.description
  } : {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    placeId: position.placeId,
    formattedAddress: position.formattedAddress
  };

  const checkIn =  { clientId: getClientId(), ...locationValues };
  console.log('created check-in', checkIn);
  return checkIn;

};

const getAutocomplete = (coords, formattedAddress) => {
  return (
    <div className={s.addressAutocomplete}>
      <AddressAutocomplete id={"checkin-autocomplete"}
                           initialValue={coords}
                           endpoint="departure"
                           location={formattedAddress}
                           className={s.autocomplete} />
    </div>
  );
};

const CheckInView = ({ geolocation, searchLocation, selectedLocation, setProperty, getGeolocation, saveCheckIn }) => {

  let positionElem = null;

  if (geolocation) {

    const position = geolocation.position && geolocation.position.coords ?
      geolocation.position : {
        coords: { latitude: 60.192059, longitude: 24.945831 },
        formattedAddress: 'Helsinki, Finland'
      };

    const coordsStr = position.coords.latitude + ',' + position.coords.longitude;
    if (searchLocation) {
      positionElem = getAutocomplete(position.coords, coordsStr);
    } else if (selectedLocation || geolocation.status === 'located') {
      const formattedAddress = selectedLocation ? selectedLocation.description : position.formattedAddress;
      positionElem = (
        <div className={s.positionValue}>
          <span onClick={() => setProperty('posts.searchLocation', true)}>{ formattedAddress }</span>
        </div>
      );
    } else if (geolocation.status === 'locating' || geolocation.status === 'error') {
      positionElem = (
        <div className={s.positionValue}>
          {
            geolocation.status === 'locating' &&
              <span onClick={() => setProperty('posts.searchLocation', true)}>Locating...</span>
          }
          {
            geolocation.status === 'error' &&
              <span onClick={() => setProperty('posts.searchLocation', true)}>Geolocation failed</span>
          }
        </div>
      );
    }
  }

	return (
	  <div className={s.root}>
      <div className={s.container}>
        <div className={s.placeSelector}>
          <div className={s.positionContainer}>
            <div className={s.positionButton} onClick={() => {
              setProperty('posts.searchLocation', false);
              setProperty('departure', null);
              getGeolocation();
            }}>
              <FontIcon className="material-icons" style={{ fontSize: '30px' }}>my_location</FontIcon>
            </div>
            <div className={s.positionSelector}>
              {
                (selectedLocation || geolocation.status === 'located') &&
                  <div className={s.editPositionButton} onClick={() => {
                    setProperty('posts.addType', null);
                    saveCheckIn({ checkIn: createCheckIn(geolocation, selectedLocation) });
                  }}>
                    <FontIcon className="material-icons" style={{ fontSize: '30px', color: '#2eb82e' }}>add_box</FontIcon>
                  </div>
              }

              { positionElem }
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
    savedCheckIn: state.posts.checkIn,
    searchLocation: state.posts.searchLocation,
    selectedLocation: state.editLink.departure,
    env: state.env
  }), {
    setProperty,
    getGeolocation,
    saveCheckIn,
    saveTripCoord
  })(withStyles(s)(CheckInView))
);
