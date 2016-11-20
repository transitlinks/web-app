import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LocalityAutocomplete.css';
import cx from 'classnames';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { autocomplete } from '../../actions/autocomplete';
import { selectLocality } from '../../actions/editLink';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

const searchTriggered = (input) => {
  return input && input.length > 2;
};

const LocalityAutocomplete = ({ 
  endpoint, className, compact,
  predictions, input, id,
  setProperty, autocomplete, selectLocality
}) => {
  
  const onSelect = (locality) => {
    selectLocality({ endpoint, locality: locality.value });
  };

  const onUpdateInput = (input) => { 
    setProperty('localityInput', input);
    if (searchTriggered(input)) {
      autocomplete(input);
    }
  };

  const dataSource = () => {
    
    if (!searchTriggered(input)) {
      return [];
    }

    return (predictions || []).map(locality => {
      return {
        id: locality.id,
        text: locality.name,
        value: locality,
        elem: (
          <MenuItem id={locality.id} style={{ "WebkitAppearance": "initial" }}
            primaryText={locality.name} />
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
  };

  return (
    <div className={cx(className, s.container)}>
      <AutoComplete id={id}
        {...props}
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
  input: state.autocomplete.input
}), {
  setProperty,
  autocomplete,
  selectLocality
})(withStyles(s)(LocalityAutocomplete));
