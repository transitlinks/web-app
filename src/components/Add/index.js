import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Add.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const formatCoords = (coords) => {
  const { latitude, longitude } = coords;
  return `${latitude}`.substring(0, 6) + '/' + `${longitude}`.substring(0, 6);
};

const AddView = ({ children, type, intl, geolocation }) => {

  let positionElem = null;
  if (geolocation) {
    if (geolocation.status === 'located') {
      const { position } = geolocation;
      positionElem = (
        <div>
          { formatCoords(position.coords) }
        </div>
      );
    } else if (geolocation.status === 'locating') {
      positionElem = (
        <div>
          Locating...
        </div>
      );
    } else if (geolocation.status === 'error') {
      positionElem = (
        <div>
          { geolocation.error }
        </div>
      );
    }
  }

	return (
    <div className={s.container}>
      <div className={s.placeSelector}>
        { positionElem }
      </div>
      <div className={s.postContent}>
        <div className={s.contentTypeContainer}>
          Content type
        </div>
        <div className={s.contentEditor}>
          Edit content
        </div>
      </div>
    </div>
  );

};

AddView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    geolocation: {
      status: state.global['geolocation.status'],
      position: state.global['geolocation.position'],
      error: state.global['geolocation.error']
    }
  }), {
  })(withStyles(s)(AddView))
);
