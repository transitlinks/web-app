import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setLoginParams } from '../../actions/login';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Login.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as utils from "../../core/utils";
import EmailInput from '../EmailInput';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const LoginView = ({ intl, setLoginParams, email, password }) => {
    
  const textFieldCss = {
    width: "100%"
  };

  const showPwdCss = {
    position: "absolute",
    right: "0px",
    top: "40px",
    cursor: "pointer"
  };

  const emailStatus = utils.emailValid(email);
  const passwordStatus = utils.passwordValid(password);
  const disableLogin = !(emailStatus.pass && passwordStatus.pass);
	
	const togglePassword = () => {
    const pwdContainer = document.getElementById("password");
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
 
	const handleInputChange = (event) => { 
    const loginParams = { email, password };
    loginParams[event.target.name] = event.target.value;
		setLoginParams(loginParams);
  };
	
	
	return (
    <div>
      <div>
        <div className={s.description}>
          <FormattedMessage {...msg['login-info']} />
          <br/><br/>
          <FormattedMessage {...msg['terms-text']} />&nbsp;
          <a href="/about">
            <FormattedMessage {...msg['terms-link']} />
          </a>.
        </div>
        <div className={s.extLogin}>
          <div className={s.fbLogin}>
            <a href="/login/fb">
              <div className={s.fbButton}>
                <img src={require("./FB-f-Logo__blue_50.png")} />
              </div>
              <div className={s.fbText}>
                <FormattedMessage {...msg['facebook']} />
              </div>
            </a>  
          </div>
          <div className={s.gLogin}>
            <a href="/login/google">
              <div className={s.gButton}>
                <img src={require("./btn_google.png")} />
              </div>
              <div className={s.gText}>
                <FormattedMessage {...msg['google']} />
              </div>
            </a>  
          </div>
        </div>
        <form action="/login" method="post" className={s.pwdLogin}>
          <div className={s.formTitle}>
            <FormattedMessage {...msg['local']} />
          </div>
          <div className={s.formItem}>
            <div className={s.formInput}>
              <EmailInput value={email} onChange={handleInputChange} />
            </div>
          </div>
          <div className={s.formItem}>
            <div className={s.formInput} id="password">
              <TextField id="input-password"
                style={textFieldCss}
                type="password"
                name="password"
                floatingLabelText={intl.formatMessage(msg[passwordStatus.text])}
                floatingLabelStyle={passwordStatus.style}
                value={password}
                onChange={(event) => handleInputChange(event)} /> 
              <div onClick={() => togglePassword()} style={showPwdCss}>
                <i className="material-icons">&#xE8F5;</i>
              </div>
            </div>
          </div>
          <div className={s.formSubmit}>  
            <div className={s.recoveryLink}>
              <a href="/login/recovery">
                <FormattedMessage {...msg['reset-password']} />
              </a>
            </div>
            <div className={s.submitButton}>
              <RaisedButton disabled={disableLogin}
                secondary={true} type="submit" 
                label={intl.formatMessage(msg['sign-in'])}>
              </RaisedButton>
            </div>
          </div>
          <div>
          </div>
        </form>
      </div>
    </div>
  );

}; 

LoginView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
	  email: state.login.loginParams.email,
    password: state.login.loginParams.password
  }), {
    setLoginParams
  })(withStyles(s)(LoginView))
);
