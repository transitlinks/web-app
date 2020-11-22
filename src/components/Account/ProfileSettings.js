import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProfileSettings.css';
import { setProperty } from '../../actions/properties';
import { saveProfile} from '../../actions/account';
import { injectIntl } from 'react-intl';
import TextField from 'material-ui/TextField';
import AvatarEditor from 'react-avatar-editor';
import * as utils from '../../core/utils';
import RaisedButton from 'material-ui/RaisedButton';

const ProfileSettings = ({ profile, withSubmit, env, savedProfile, username, uploadAvatar, setProperty, saveProfile }) => {

  const userProfile = savedProfile || profile;
  const usernameValue = username === undefined || username === null ? userProfile.username : username;

  const onFileInputChange = (event) => {
    setProperty('profile.uploadAvatar', event.target.files[0]);
  };


  const displayNameStatus = utils.displayNameValid(usernameValue);

  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.settings}>
          <div className={s.displayName}>
            <div className={s.displayNameLabel}>
              Display name
            </div>
            <div className={s.displayNameInput}>
              <TextField style={{ width: '100%' }}
                         floatingLabelText={displayNameStatus.text}
                         floatingLabelStyle={displayNameStatus.style}
                         value={usernameValue}
                         onChange={(event) => setProperty('profile.username', event.target.value)} />
            </div>
          </div>
          <div className={s.avatar}>
            {
                <div className={s.editAvatar}>
                  <AvatarEditor
                    image={uploadAvatar || `${env.MEDIA_URL}${userProfile.avatar}`}
                    width={74}
                    height={74}
                    border={2}
                    borderRadius={37}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={1.2}
                    rotate={0}
                  />
                  <div className={s.editAvatarButton}>
                    <input type="file" name="file" id="file" onChange={onFileInputChange} className={s.fileInput} />
                    <label htmlFor="file">
                      <FontIcon className="material-icons" style={{ fontSize: '30px' }} onClick={() => {
                        setProperty('profile.editAvatar', true);
                      }}>add_a_photo</FontIcon>
                    </label>
                  </div>
                </div>
            }
          </div>
        </div>
        {
          withSubmit &&
            <div className={s.submit}>
              <RaisedButton disabled={!displayNameStatus.pass}
                            label={'Confirm profile settings'}
                            onClick={() => saveProfile(userProfile.uuid, { username: usernameValue })} />
            </div>
        }
      </div>
    </div>
  );

};

ProfileSettings.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    env: state.env,
    savedProfile: state.profile.savedProfile,
    username: state.profile.username,
    uploadAvatar: state.profile.uploadAvatar
  }), {
    setProperty,
    saveProfile
  })(withStyles(s)(ProfileSettings))
);
