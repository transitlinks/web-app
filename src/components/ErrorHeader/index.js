import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ErrorHeader.css';

import { injectIntl } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';

const ErrorHeader = ({ error, setProperty }) => {

  const errorClasses = {
    'PrelaunchError': s.prelaunchError
  };

  const errorElems = (!error || !error.errors) ? [] : error.errors.map(err => {
    return (
      <div className={errorClasses[err.name] || s.defaultError}>
        <div>{ err.text }</div>
        <div className={s.okButton}>
          <RaisedButton label="OK" onClick={() => {
            setProperty(`posts.error`, null);
            setProperty(`editTerminal.error`, null);
          }} />
        </div>
      </div>
    );
  });

	return (
    <div className={s.errors}>
      {errorElems}
    </div>
  );

};

ErrorHeader.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    error: { ...state.posts.error, ...state.editTerminal.error }
  }), {
    setProperty
  })(withStyles(s)(ErrorHeader))
);
