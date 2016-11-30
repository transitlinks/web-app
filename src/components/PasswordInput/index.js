import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import TextField from 'material-ui/TextField';
import * as utils from "../../core/utils";
import { injectIntl } from 'react-intl';
import msg from './messages';

const PasswordInput = ({ 
  id, name,
  intl, 
  value, onChange 
}) => {
    
  const textFieldCss = {
    width: "100%"
  };
  
  const showPwdCss = {
    position: "absolute",
    right: "0px",
    top: "40px",
    cursor: "pointer"
  };
  
  const handleChange = (event) => {
    const passwordStatus = utils.passwordValid(event.target.value);
    onChange({ name, value: event.target.value, pass: passwordStatus.pass });
  };
 
  const togglePassword = () => {

    const pwdContainer = document.getElementById(id);
    const pwdField = pwdContainer.getElementsByTagName("input")[0];
    const imageElem = pwdContainer.getElementsByTagName("i")[0];
    if (pwdField.type === "password") {
      pwdField.type = "text";
      imageElem.innerHTML = "&#xE8F4;";
    } else {
      pwdField.type = "password";
      imageElem.innerHTML = "&#xE8F5;";
    }

  };

  const passwordStatus = utils.passwordValid(value);
  return (
    <div style={{ position: 'relative' }} id={id}>
      <TextField id={`${id}-input`}
        style={textFieldCss}
        type="password"
        name={name}
        floatingLabelText={intl.formatMessage(msg[passwordStatus.text])}
        floatingLabelStyle={passwordStatus.style}
        value={value}
        onChange={handleChange} /> 
      <div onClick={() => togglePassword()} style={showPwdCss}>
        <i className="material-icons">&#xE8F5;</i>
      </div>
    </div>
  );

};

PasswordInput.propTypes = { 
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default injectIntl(PasswordInput);


