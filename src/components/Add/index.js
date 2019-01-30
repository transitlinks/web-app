import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Add.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const AddView = ({ children, type, intl, geolocation }) => {

  let positionElem = null;
  if (geolocation) {
    if (geolocation.status === 'located') {
      const { position } = geolocation;
      positionElem = (
        <div>
          { position.coords.latitude } / { position.coords.longitude }
        </div>
      );
    }
  }

	return (
    <div className={s.container}>
      <div className={s.placeSelector}>
        Place selector
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
