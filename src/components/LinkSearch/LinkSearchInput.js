import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LinkSearchInput.css';
import { connect } from 'react-redux';
import { searchLinks } from '../../actions/searchLinks';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';

const LinkSearchInput = ({ 
  searchLinks
}) => {

  const onUpdateInput = (event) => {
    
    const input = event.target.value;
    if (!input || input.length < 3) {
      return;
    }

    searchLinks(input);

  };

  const props = {
    fullWidth: true,
    style: { height: '40px' },
    floatingLabelStyle: { top: '8px' },
    floatingLabelFocusStyle: { display: 'none' },
    hintStyle: { bottom: '10px', left: '4px' },
    inputStyle: { marginTop: '-2px' }
  };

  return (
    <div className={s.container}>
      <TextField id="link-search-input"
        {...props}
        hintText="Search any place"
        floatingLabelText="Origin or destination"
        onChange={onUpdateInput}
      />
    </div>
  );

}

LinkSearchInput.propTypes = {
};

export default connect(state => ({
}), {
  searchLinks
})(withStyles(s)(LinkSearchInput));
