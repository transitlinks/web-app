import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Profile.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import EmailInput from '../EmailInput';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages.profile';

const Profile = ({ intl, profile }) => {	
	
	return (
    <div>
      <div>
        <FormattedMessage {...msg['email']} />
        {profile.email}
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
  }), {
  })(withStyles(s)(Profile))
);
