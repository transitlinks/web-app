import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LocalityAutocomplete.css';
import cx from 'classnames';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { searchLocalities } from '../../actions/autocomplete';
import { selectLocality } from '../../actions/editLink';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import { reverseGeocode } from '../../services/linkService';

const searchTriggered = (input) => {
  return input && input.length > 2;
};

const LocalityAutocomplete = ({ 
  endpoint, className, compact,
  initialInput, predictions, input, id,
  setProperty, searchLocalities, selectLocality
}) => {
  
  const setPlace = (placeId) => {
    reverseGeocode(placeId, (result) => {
      const terminal = endpoint === 'from' ? 'departure' : 'arrival';
      const location = result.geometry.location;
      setProperty(terminal, {
        lat: location.lat(),
        lng: location.lng(),
        description: result.formatted_address
      });
    });
  };

  const onSelect = (locality) => {
    setPlace(locality.id);
    selectLocality({ endpoint, locality: locality.value });
  };

  const onUpdateInput = (input) => { 
    setProperty('localityInput', input);
    if (searchTriggered(input)) {
      searchLocalities(input);
    }
  };

  const dataSource = () => {
    
    if (!searchTriggered(input)) {
      return [];
    }

    return (predictions || []).map(locality => {
      return {
        id: locality.apiId,
        text: locality.description,
        value: locality,
        elem: (
          <MenuItem id={locality.apiId} style={{ "WebkitAppearance": "initial" }}
            primaryText={locality.description} />
        )
      };
    });
  };
  
  const props = compact ? {
    fullWidth: true,
    style: { height: '52px' },
    floatingLabelStyle: { top: '20px' },
    floatingLabelFocusStyle: { transform: 'scale(0.75) translate(0px, -20px)' }
  } : {
    fullWidth: true
  };
  
  return (
    <div className={cx(className, s.container)}>
      <AutoComplete id={id}
        {...props}
        searchText={initialInput}
        hintText="Search place"
        floatingLabelText={endpoint === 'from' ? 'Origin' : 'Destination'}
        filter={AutoComplete.noFilter}
        dataSource={dataSource()}
        dataSourceConfig={{ text: 'text', value: 'elem' }}
        onUpdateInput={onUpdateInput}
        onNewRequest={onSelect}
      />
    </div>
  );

}

LocalityAutocomplete.propTypes = {
  predictions: React.PropTypes.array
};

export default connect(state => ({
  predictions: state.autocomplete.localities,
  input: state.autocomplete.localityInput
}), {
  setProperty,
  searchLocalities,
  selectLocality
})(withStyles(s)(LocalityAutocomplete));
