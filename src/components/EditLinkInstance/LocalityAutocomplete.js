import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LocalityAutocomplete.css';
import { connect } from 'react-redux';
import { autocomplete } from '../../actions/autocomplete';
import { selectLocality } from '../../actions/editLink';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

const LocalityAutocomplete = ({ 
  endpoint, predictions, autocomplete, selectLocality 
}) => {

  const onSelect = (value) => {
    selectLocality({ endpoint, locality: value.id });
  };

  const onUpdateInput = (input) => {
    
    if (!input || input.length < 3) {
      return;
    }

    autocomplete(input);

  };

  const dataSource = () => {
    return (predictions || []).map(locality => {
      return {
        id: locality.id,
        text: locality.name,
        value: (
          <MenuItem style={{ "WebkitAppearance": "initial" }}
            primaryText={locality.name} />
        )
      };
    });
  };

  return (
    <div className={s.container}>
      <AutoComplete id="locality-autocomplete"
        hintText="Search place"
        floatingLabelText={endpoint === 'from' ? 'Origin' : 'Destination'}
        filter={AutoComplete.noFilter}
        dataSource={dataSource()}
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
}), {
  autocomplete,
  selectLocality
})(withStyles(s)(LocalityAutocomplete));
