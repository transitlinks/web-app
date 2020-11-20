import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { resetPassword, saveProfile } from '../../actions/account';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Profile.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import EmailInput from '../EmailInput';
import PasswordInput from '../PasswordInput';
import ProfileSettings from './ProfileSettings';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages.profile';
import { emailValid } from '../../core/utils';

const Profile = ({
  intl,
  setProperty,
  resetPassword, saveProfile,
  email, username, password, passwordValid,
  saveProfileResult, resetPasswordResult,
  profile
}) => {

  const handleEmailChange = (input) => {
    setProperty('profile-email', { email: input.value, valid: input.pass });
  };

  const handlePasswordChange = (input) => {
    setProperty('profile-password', { password: input.value, valid: input.pass });
  };

  const emailValue = (email === null || email === undefined) ? profile.email : email;
  const usernameValue = (username === null || username === undefined) ? profile.username : username;

	return (
    <div>
      <div>
        <ProfileSettings />
      </div>
      <div id="profile-fields" className={s.emailPassword}>
        <div className={s.email}>
          <EmailInput id="profile-email" name="profile-email" value={emailValue} onChange={handleEmailChange} />
          <div className={s.save}>
            {
              saveProfileResult === 'success' &&
              <FormattedMessage {...msg['save-profile-success']} />
            }
            {
              saveProfileResult === 'error' &&
              <FormattedMessage {...msg['save-profile-error']} />
            }
            <RaisedButton className={s.button}
                          disabled={!emailValid(emailValue).pass || (emailValue === profile.email && usernameValue === profile.username)}
                          label={intl.formatMessage(msg['save-profile'])}
                          onClick={() => saveProfile(profile.uuid, { email: emailValue, username: usernameValue })} />
          </div>
        </div>
        <div id="password-reset" className={s.password}>
          <div>
            <FormattedMessage {...msg['reset-password']} />
            <PasswordInput id="profile-password" name="profile-password" value={password || ''} onChange={handlePasswordChange} />
          </div>
          <div className={s.save}>
            {
              resetPasswordResult === 'success' &&
              <FormattedMessage {...msg['reset-password-success']} />
            }
            {
              resetPasswordResult === 'error' &&
              <FormattedMessage {...msg['reset-password-error']} />
            }
            <RaisedButton className={s.button}
                          disabled={!(password && passwordValid)}
                          label={intl.formatMessage(msg['confirm-reset'])}
                          onClick={() => resetPassword(profile.uuid, password)} />
          </div>
        </div>
      </div>
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    email: state.profile.email,
    username: state.profile.username,
    emailValid: state.profile.emailValid,
    password: state.profile.password,
    passwordValid: state.profile.passwordValid,
    saveProfileResult: state.profile.saveProfileResult,
    resetPasswordResult: state.profile.resetPasswordResult
  }), {
    setProperty, resetPassword, saveProfile
  })(withStyles(s)(Profile))
);
