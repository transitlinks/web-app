import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PlaceSearchInput.css';
import TextField from 'material-ui/TextField';

const PlaceSearchInput = ({ id }) => {
  return (
    <div className={s.container}>
      <TextField id={id} />
    </div>
  );
};

export default withStyles(s)(PlaceSearchInput);
