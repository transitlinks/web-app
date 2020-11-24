import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { resetPassword, saveProfile } from '../../actions/account';
import { uploadFiles } from '../../actions/posts';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Profile.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import EmailInput from '../EmailInput';
import PasswordInput from '../PasswordInput';
import ProfileSettings from './ProfileSettings';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages.profile';
import { displayNameValid, emailValid } from '../../core/utils';

const Profile = ({
  intl,
  setProperty, resetPassword, saveProfile, uploadFiles,
  email, username, avatarFile, password, passwordValid,
  avatarEditor,
  saveProfileResult, resetPasswordResult,
  profile, savedProfile, avatarPosition,
}) => {

  const handleEmailChange = (input) => {
    setProperty('profile-email', { email: input.value, valid: input.pass });
  };

  const handlePasswordChange = (input) => {
    setProperty('profile-password', { password: input.value, valid: input.pass });
  };

  const userProfile = savedProfile || profile;
  const emailValue = (email === null || email === undefined) ? userProfile.email : email;
  const usernameValue = (username === null || username === undefined) ? userProfile.username : username;

  let settingsChanged = false;
  if (avatarPosition) {
    if (avatarPosition.x !== userProfile.avatarX || avatarPosition.y !== userProfile.avatarY) {
      settingsChanged = true;
    }
  }
  if (emailValue !== userProfile.email || usernameValue !== userProfile.username) {
    settingsChanged = true;
  }
  if (avatarFile) {
    settingsChanged = true;
  }

  const saveUserProfile = () => {

    const avatarPositionValues = {};
    if (avatarPosition) {
      avatarPositionValues.avatarX = avatarPosition.x;
      avatarPositionValues.avatarY = avatarPosition.y;
    }

    if (avatarFile) {
      uploadFiles({
        entityType: 'AvatarSource',
        entityUuid: userProfile.uuid
      }, [avatarFile]);
    }

    if (avatarFile || avatarPosition) {
      const canvasScaled = avatarEditor.getImageScaledToCanvas();
      canvasScaled.toBlob((blob) => {
        const file = new File([blob], `${userProfile.uuid}.jpg`, { type: 'image/jpeg' });
        uploadFiles({
          entityType: 'Avatar',
          entityUuid: userProfile.uuid
        }, [file]);
      }, 'image/jpeg');
    }

    saveProfile(userProfile.uuid, { email: emailValue, username: usernameValue, ...avatarPositionValues });

  };

	return (
    <div>
      <div>
        <ProfileSettings profile={profile} />
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
                          disabled={!emailValid(emailValue).pass || !displayNameValid(usernameValue).pass || !settingsChanged}
                          label={intl.formatMessage(msg['save-profile'])}
                          onClick={() => {
                            saveUserProfile();
                          }} />
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
    resetPasswordResult: state.profile.resetPasswordResult,
    savedProfile: state.profile.savedProfile,
    avatarPosition: state.profile.avatarPosition,
    avatarFile: state.profile.avatarFile,
    avatarEditor: state.profile.avatarEditor
  }), {
    setProperty, resetPassword, saveProfile, uploadFiles
  })(withStyles(s)(Profile))
);
