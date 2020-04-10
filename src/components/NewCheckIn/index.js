import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import AddressAutocomplete from './AddressAutocomplete';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckIn.css';
import { getGeolocation } from '../../actions/global';
import { saveCheckIn } from '../../actions/posts';
import { setProperty } from '../../actions/properties';
import { getClientId } from '../../core/utils';
import { injectIntl } from 'react-intl';

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


const CheckInView = ({ geolocation, searchLocation, selectedLocation, setProperty, getGeolocation, saveCheckIn }) => {

  let positionElem = null;

  if (geolocation) {

    if (geolocation.status === 'located') {
      const { position } = geolocation;
      let coordsStr = '';
      if (position && position.coords) {
        coordsStr = position.coords.latitude + ',' + position.coords.longitude;
      }

      const formattedAddress = selectedLocation ? selectedLocation.description : position.formattedAddress;
      positionElem = !searchLocation ? (
        <div className={s.positionValue}>
          <span onClick={() => setProperty('posts.searchLocation', true)}>{ formattedAddress }</span>
        </div>
      ) : (
        <div className={s.addressAutocomplete}>
          <AddressAutocomplete id={"checkin-autocomplete"}
                               initialValue={position.coords}
                               endpoint="departure"
                               location={coordsStr}
                               className={s.autocomplete} />
        </div>
      );
    } else if (geolocation.status === 'locating') {
      positionElem = (
        <div className={s.locating}>
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

  let locationCoords = null;
  if (selectedLocation) {
    locationCoords = {
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng
    };
  } else if (geolocation && geolocation.position) {
    locationCoords = geolocation.position.coords;
  }

  console.log("selected location", selectedLocation, geolocation);

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
              <div className={s.editPositionButton} onClick={() => {
                setProperty('posts.addType', null);
                saveCheckIn({ checkIn: createCheckIn(geolocation, selectedLocation) });
              }}>
                <FontIcon className="material-icons" style={{ fontSize: '28px', color: '#2eb82e' }}>beenhere</FontIcon>
              </div>
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
    saveCheckIn
  })(withStyles(s)(CheckInView))
);
