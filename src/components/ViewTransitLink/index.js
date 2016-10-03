import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ViewTransitLink.css';
import FontIcon from 'material-ui/FontIcon';

const ViewTransitLink = ({ link }) => {
  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <span id="place-from">{link.from.name}</span>
          <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
          <span id="place-to">{link.to.name}</span>
        </div>
      </div>
    </div>
  );
}

export default withStyles(s)(ViewTransitLink);
