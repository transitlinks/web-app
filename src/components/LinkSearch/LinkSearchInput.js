import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LinkSearchInput.css';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route';
import { setProperty } from '../../actions/properties';
import { searchLinks } from '../../actions/searchLinks';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';

const LinkSearchInput = ({ 
  setProperty, searchLinks, navigate,
  searchInput, location
}) => {
  
  const onUpdateInput = (event) => {
    const input = event.target.value;
    setProperty('searchInput', input);
    if (input && input.length > 2) {
      searchLinks(input);
      navigate('/search');
    }
  };

  const props = {
    value: searchInput || '',
    fullWidth: true,
    style: { height: '46px' },
    floatingLabelStyle: { display: 'none' },
    //floatingLabelStyle: { top: '8px', transformOrigin: 'left top -100px' },
    floatingLabelFocusStyle: { display: 'none', opacity: '0.0' },
    hintStyle: { bottom: '12px', left: '4px' },
    inputStyle: { marginTop: '0px' }
  };

  if (location) {
    
    if (!location.reset && location.action !== 'REPLACE' && location.pathname !== '/search') {
      location.reset = true;
      props.value = '';
    }
    
  }
  
  return (
    <div className={s.container}>
      <TextField id="link-search-input"
        {...props}
        hintText="Origin or destination"
        floatingLabelText="Origin or destination"
        onChange={onUpdateInput}
      />
    </div>
  );

}

LinkSearchInput.propTypes = {
};

export default connect(state => ({
  searchInput: state.searchLinks.searchInput,
  location: state.routing.locationBeforeTransitions
}), {
  setProperty, searchLinks, navigate
})(withStyles(s)(LinkSearchInput));
