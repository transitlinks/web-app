import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AddressAutocomplete.css';
import cx from 'classnames';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { searchAddresses } from '../../actions/autocomplete';
import { selectAddress } from '../../actions/editLink';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import { Marker, GoogleMap, withGoogleMap } from 'react-google-maps';
import { geocode, reverseGeocode } from '../../services/linkService';

const searchTriggered = (input) => {
  return input && input.length > 2;
};

const parseLocation = (location) => {
	const latLng = location.split(',');
	const lat = parseFloat(latLng[0]);
	const lng = parseFloat(latLng[1]);
	return { lat, lng };
};

const TerminalMap = withGoogleMap(props => (
	<GoogleMap
		ref={props.onMapLoad}
		defaultZoom={12}
		defaultCenter={{...props.latLng}}
		onClick={props.onMapClick}>
		{
			props.markers.map((marker, index) => (
				<Marker
					key={index}
					{...marker}
					onRightClick={() => props.onMarkerRightClick(index)}
				/>
			))
		}
	</GoogleMap>
));

const AddressAutocomplete = ({
  env,
  endpoint, location, className, compact,
  initialValue, predictions, input, id,
  mapDialog, geocodeAddress, geocodeLatLng,
  setProperty, searchAddresses, selectAddress
}) => {

  const toggleMap = () => {
    if (mapDialog) {
      setProperty('mapDialog', null);
    } else {
      setProperty('mapDialog', endpoint);
    }
  };

	const selectLocation = () => {
		setProperty(endpoint, {
			...parseLocation(geocodeLatLng),
			description: geocodeAddress
		});
		setProperty('mapDialog', null);
  };

	const setCoords = (place) => {

    if (env.offline) return;

    reverseGeocode(place.id, (result) => {
      const location = result.geometry.location;
      setProperty(endpoint, {
        lat: location.lat(),
        lng: location.lng(),
        description: place.text
      });
    });

	};

  const onSelect = (address) => {
    setProperty('posts.searchLocation', false);
    selectAddress({ endpoint, locality: address.value });
		setCoords(address);
  };

  const onUpdateInput = (input) => {
    setProperty('addressInput', input);
    if (searchTriggered(input)) {
      searchAddresses(input, location);
    }
  };

  const dataSource = () => {

    if (!searchTriggered(input)) {
      return [];
    }

    return (predictions || []).map(place => {
      return {
        id: place.apiId,
        text: place.description,
        value: place,
        elem: (
          <MenuItem id={place.apiId} style={{ "WebkitAppearance": "initial" }}
            primaryText={place.description} />
        )
      };
    });
  };

  const props = compact ? {
    fullWidth: true,
    floatingLabelStyle: { top: '20px' },
    floatingLabelFocusStyle: { transform: 'scale(0.75) translate(0px, -20px)' }
  } : {
    fullWidth: true
  };

	const dialogActions = [
		<FlatButton key="cancel"
			label="Cancel"
			primary={true}
			onTouchTap={toggleMap} />,
		<FlatButton key="ok"
			disabled={!geocodeLatLng}
			label="OK"
			primary={true}
			onTouchTap={selectLocation}
		/>
	];

	const setPlace = (latLng) => {

    if (env.offline) return;

		geocode(latLng, (result) => {
			setProperty('geocodeAddress', result.formatted_address);
			setProperty('geocodeLatLng', latLng.lat + ',' + latLng.lng);
		});

	};

	const mapLoaded = () => {
	};

	const mapClicked = (loc) => {
		const lat = loc.latLng.lat();
		const lng = loc.latLng.lng();
		setPlace({ lat, lng });
	};

	const renderMap = (markers) => {

		return  (
			<TerminalMap
    		containerElement={
      		<div style={{ height: `100%` }} />
    		}
    		mapElement={
      		<div style={{ height: `100%` }} />
    		}
				latLng={parseLocation(location)}
    		onMapLoad={mapLoaded}
    		onMapClick={mapClicked}
    		markers={markers}
  		/>
		);
	};

	const getMarkers = () => {

		const latLngStr = geocodeLatLng || location;
		if (!latLngStr) {
			return [];
		}

		return [{
			position: parseLocation(latLngStr)
		}];

	};

  return (
    <div className={cx(className, s.container)}>
			<Dialog
				contentStyle={{ maxWidth: '600px' }}
				title={`Set ${endpoint} location`}
				actions={dialogActions}
				modal={false}
				open={mapDialog === endpoint || mapDialog === endpoint + 'Loaded'}
				onRequestClose={toggleMap}>
      	<div className={s.mapContainer}>
        	<div id="terminal-map" className={s.map}>
						{renderMap(getMarkers())}
						{geocodeAddress}
					</div>
				</div>
			</Dialog>
      <div className={s.addressInput}>
        <AutoComplete id={id}
          {...props}
          searchText={initialValue ? (initialValue.description || '') : ''}
          hintText="Search location"
          filter={AutoComplete.noFilter}
          dataSource={dataSource()}
          dataSourceConfig={{ text: 'text', value: 'elem' }}
          onUpdateInput={onUpdateInput}
          onNewRequest={onSelect}
        />
      </div>
      <div className={s.mapButton} onClick={() => toggleMap()}>
        <i className="material-icons">map</i>
      </div>
    </div>
  );

}

AddressAutocomplete.propTypes = {
  predictions: React.PropTypes.array
};

export default connect(state => ({
  env: state.env,
  input: state.autocomplete.addressInput,
  predictions: state.autocomplete.localities,
  mapDialog: state.editLink.mapDialog,
	geocodeAddress: state.editLink.geocodeAddress,
	geocodeLatLng: state.editLink.geocodeLatLng
}), {
  setProperty,
  searchAddresses,
  selectAddress
})(withStyles(s)(AddressAutocomplete));
