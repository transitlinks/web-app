import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserLinks.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as utils from "../../core/utils";
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages.links';

const UserLinks = ({ intl, userLinks }) => {	
	
  const linkElems = userLinks.linkInstances.map((linkInstance, index) => (
    <div key={index} className="user-link">
      {linkInstance.link.from.description} / 
      {linkInstance.link.to.description} / 
      {linkInstance.transport.slug}
    </div>
  ));

	return (
    <div>
      <div>
        <FormattedMessage {...msg['links-title']} />
      </div>
      <div>
        {linkElems}
      </div>
    </div>
  );

}; 

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(UserLinks))
);
