import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Login.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as utils from "../../core/utils";
import EmailInput from '../EmailInput';
import PasswordInput from '../PasswordInput';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const LoginView = ({
  intl, error,
  setProperty,
  email, emailValid, password, passwordValid
}) => {

  const disableLogin = !(emailValid && passwordValid);

  const handleEmailChange = (input) => {
    setProperty('login-email', { email: input.value, valid: input.pass });
  };

  const handlePasswordChange = (input) => {
    setProperty('login-password', { password: input.value, valid: input.pass });
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
        {
          error &&
          <div className={s.error}>
            <FormattedMessage {...msg[error.message]} />
          </div>
        }
        <form action="/login" method="post" className={s.pwdLogin}>
          <div className={s.formTitle}>
            <FormattedMessage {...msg['local']} />
          </div>
          <div className={s.formItem}>
            <div className={s.formInput}>
              <EmailInput id="login-email" name="email" value={email || ''} onChange={handleEmailChange} />
            </div>
          </div>
          <div className={s.formItem}>
            <div className={s.formInput} id="password">
              <PasswordInput id="login-password" name="password" value={password || ''} onChange={handlePasswordChange} />
            </div>
          </div>
          <div className={s.formSubmit}>
            <div className={s.recoveryLink}>
              <a href="/reset-password">
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
	  email: state.login.email,
	  emailValid: state.login.emailValid,
    password: state.login.password,
    passwordValid: state.login.passwordValid,
    error: state.runtime.reqError
  }), {
    setProperty
  })(withStyles(s)(LoginView))
);
