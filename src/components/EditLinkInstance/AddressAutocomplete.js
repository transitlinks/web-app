import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AddressAutocomplete.css';
import cx from 'classnames';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { searchAddresses } from '../../actions/autocomplete';
import { selectAddress } from '../../actions/editLink';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

const searchTriggered = (input) => {
  return input && input.length > 2;
};

const AddressAutocomplete = ({
  endpoint, location, className, compact,
  initialValue, predictions, input, id,
  setProperty, searchAddresses, selectAddress
}) => {

  const openMap = () => {
    console.log("open map");
  };

  const onSelect = (address) => {
    selectAddress({ endpoint, locality: address.value });
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
    style: { height: '52px' },
    floatingLabelStyle: { top: '20px' },
    floatingLabelFocusStyle: { transform: 'scale(0.75) translate(0px, -20px)' }
  } : {
    fullWidth: true
  };
  
  return (
    <div className={cx(className, s.container)}>
      <div className={s.addressInput}>
        <AutoComplete id={id}
          {...props}
          searchText={initialValue ? (initialValue.description || '') : ''}
          hintText="Search location"
          floatingLabelText="Location"
          filter={AutoComplete.noFilter}
          dataSource={dataSource()}
          dataSourceConfig={{ text: 'text', value: 'elem' }}
          onUpdateInput={onUpdateInput}
          onNewRequest={onSelect}
        />
      </div>
      <div className={s.mapButton} onClick={() => openMap(endpoint)}>
        <i className="material-icons">map</i>
      </div>
    </div>
  );

}

AddressAutocomplete.propTypes = {
  predictions: React.PropTypes.array
};

export default connect(state => ({
  input: state.autocomplete.addressInput,
  predictions: state.autocomplete.localities
}), {
  setProperty,
  searchAddresses,
  selectAddress
})(withStyles(s)(AddressAutocomplete));
