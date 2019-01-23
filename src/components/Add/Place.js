import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { resetPassword, saveProfile } from '../../actions/account';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Place.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import EmailInput from '../EmailInput';
import PasswordInput from '../PasswordInput';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages.profile';

const Profile = ({
  intl,
  setProperty,
  resetPassword, saveProfile,
  email, emailValid, password, passwordValid,
  saveProfileResult, resetPasswordResult,
  place
}) => {

  return (
    <div>
      <div id="profile-fields" className={s.profile}>
        Add place
      </div>
      <div>
      </div>
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    email: state.profile.email,
    emailValid: state.profile.emailValid,
    password: state.profile.password,
    passwordValid: state.profile.passwordValid,
    saveProfileResult: state.profile.saveProfileResult,
    resetPasswordResult: state.profile.resetPasswordResult
  }), {
    setProperty, resetPassword, saveProfile
  })(withStyles(s)(Profile))
);
