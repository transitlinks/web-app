import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Profile.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import EmailInput from '../EmailInput';
import PasswordInput from '../PasswordInput';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages.profile';

const Profile = ({ 
  intl,
  setProperty,
  email, emailValid, password, passwordValid,
  profile
}) => {	

  const handleEmailChange = (input) => {
    setProperty('profile-email', { email: input.value, valid: input.pass });
  };
  
  const handlePasswordChange = (input) => {
    setProperty('profile-password', { password: input.value, valid: input.pass });
  };

  const resetPassword = () => {
  };
  
  const saveProfile = () => {
  };
  
	return (
    <div>
      <div>
        <FormattedMessage {...msg['email']} />
        <EmailInput id="profile-email" name="profile-email" value={email || ''} onChange={handleEmailChange} />
        <RaisedButton disabled={!(emailValid)}
          label={intl.formatMessage(msg['save-profile'])} onClick={saveProfile} />
      </div>
      <div>
        <FormattedMessage {...msg['reset-password']} />
        <PasswordInput id="profile-password" name="profile-password" value={password || ''} onChange={handlePasswordChange} />
        <RaisedButton disabled={!(password && passwordValid)}
          label={intl.formatMessage(msg['confirm-reset'])} onClick={resetPassword} />
      </div>
      <div>
        <FormattedMessage {...msg['photo']} />
        {profile.photo}
      </div>
    </div>
  );

}; 

export default injectIntl(
  connect(state => ({
    email: state.profile.email,
    emailValid: state.profile.emailValid,
    password: state.profile.password,
    passwordValid: state.profile.passwordValid
  }), {
    setProperty
  })(withStyles(s)(Profile))
);
