import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import TextField from 'material-ui/TextField';
import * as utils from "../../core/utils";
import { injectIntl } from 'react-intl';
import msg from './messages';

const EmailInput = ({ intl, value, onChange }) => {
    
  const textFieldCss = {
    width: "100%"
  };

  const emailStatus = utils.emailValid(value);
  console.log("email status", emailStatus);	
  return (
    <TextField id="input-email"
      style={textFieldCss}
      name="email"
      floatingLabelText={intl.formatMessage(msg[emailStatus.text])}
      floatingLabelStyle={emailStatus.style}
      value={value} 
      onChange={onChange} />
  );

};

export default injectIntl(EmailInput);


