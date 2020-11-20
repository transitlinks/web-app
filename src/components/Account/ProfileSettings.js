import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProfileSettings.css';
import { setProperty } from '../../actions/properties';
import { injectIntl } from 'react-intl';
import TextField from 'material-ui/TextField';

const ProfileSettings = ({ savedProfile, username, setProperty }) => {

  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.userName}>
          <TextField style={{ width: '100%' }}
                     floatingLabelText="Username"
                     value={username}
                     onChange={(event) => setProperty('profile.username', event.target.value)} />
        </div>
        <div className={s.avatar}>
          <div className={s.avatarImage}>
            +
          </div>
          <div className={s.avatarInfo}>
            fileName.jpg
          </div>
        </div>
      </div>
    </div>
  );

};

ProfileSettings.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    savedProfile: state.profile.savedProfile,
    username: state.profile.username
  }), {
    setProperty
  })(withStyles(s)(ProfileSettings))
);
