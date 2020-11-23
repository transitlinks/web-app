import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProfileSettings.css';
import { setProperty } from '../../actions/properties';
import { saveProfile } from '../../actions/account';
import { uploadFiles } from '../../actions/posts';
import { injectIntl } from 'react-intl';
import TextField from 'material-ui/TextField';
import AvatarEditor from 'react-avatar-editor';
import * as utils from '../../core/utils';
import RaisedButton from 'material-ui/RaisedButton';

const ProfileSettings = ({
  profile, withSubmit, env, savedProfile, username, avatarFile, avatarPosition, avatarEditor,
  setProperty, saveProfile, uploadFiles
}) => {

  const userProfile = savedProfile || profile;
  const usernameValue = username === undefined || username === null ? userProfile.username : username;

  const onFileInputChange = (event) => {
    setProperty('profile.avatarFile', event.target.files[0]);
  };


  const displayNameStatus = utils.displayNameValid(usernameValue);

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

    saveProfile(userProfile.uuid, { username: usernameValue, ...avatarPositionValues });

  };

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
                    ref={(editor) => {
                      if (!avatarEditor && editor && !editor.loaded) {
                        editor.loaded = true;
                        setProperty('profile.avatarEditor', editor);
                      }
                    }}
                    onPositionChange={(position) => setProperty('profile.avatarPosition', position)}
                    image={avatarFile || `${env.MEDIA_URL}${userProfile.avatarSource}?${(new Date()).getTime()}`}
                    width={74}
                    height={74}
                    border={2}
                    position={avatarPosition || { x: userProfile.avatarX, y: userProfile.avatarY }}
                    borderRadius={37}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={1}
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
                            onClick={() => {
                              saveUserProfile();
                            }} />
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
    avatarFile: state.profile.avatarFile,
    avatarPosition: state.profile.avatarPosition,
    avatarEditor: state.profile.avatarEditor
  }), {
    setProperty,
    saveProfile,
    uploadFiles
  })(withStyles(s)(ProfileSettings))
);
