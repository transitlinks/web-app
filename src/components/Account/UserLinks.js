import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserLinks.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import UserLinkInstance from './UserLinkInstance';
import { extractLinkAreas } from '../utils';
import * as utils from "../../core/utils";
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages.links';

const UserLinks = ({ intl, userLinks }) => {	
  
  const instances = userLinks.linkInstances.map(instance => <UserLinkInstance instance={instance} />);

	return (
    <div>
      <div>
        {instances}
      </div>
    </div>
  );

}; 

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(UserLinks))
);
