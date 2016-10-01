import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TransitLink.css';
import FontIcon from 'material-ui/FontIcon';

function TransitLink({ link }) {
  return (
    <div className={s.container}>
      <span id="place-from">{link.from.name}</span>
      <FontIcon className="material-icons">arrow_forward</FontIcon>
      <span id="place-to">{link.to.name}</span>
    </div>
  );
}

export default withStyles(s)(TransitLink);
