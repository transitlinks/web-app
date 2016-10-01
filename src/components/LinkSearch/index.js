import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LinkSearch.css';
import FontIcon from 'material-ui/FontIcon';
import PlaceSearchInput from './PlaceSearchInput';

function LinkSearch() {
  return (
    <div className={s.container}>
      <PlaceSearchInput id="place-from" />
      <FontIcon className="material-icons">arrow_forward</FontIcon>
      <PlaceSearchInput id="place-to" />
    </div>
  );
}

export default withStyles(s)(LinkSearch);
