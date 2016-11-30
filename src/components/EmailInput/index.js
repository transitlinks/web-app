import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import TextField from 'material-ui/TextField';
import * as utils from "../../core/utils";
import { injectIntl } from 'react-intl';
import msg from './messages';

const EmailInput = ({ 
  id, name, 
  intl, 
  value, onChange 
}) => {
    
  const textFieldCss = {
    width: "100%"
  };
  
  const handleChange = (event) => {
    const emailStatus = utils.emailValid(event.target.value);
    onChange({ name, value: event.target.value, pass: emailStatus.pass });
  };
 
  const emailStatus = utils.emailValid(value);
  return (
    <TextField id={id}
      style={textFieldCss}
      name={name}
      floatingLabelText={intl.formatMessage(msg[emailStatus.text])}
      floatingLabelStyle={emailStatus.style}
      value={value} 
      onChange={handleChange} />
  );

};

EmailInput.propTypes = { 
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default injectIntl(EmailInput);


