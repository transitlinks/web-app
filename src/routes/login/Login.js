import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Login.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as utils from "../../core/utils";

const title = 'Log In';

const renderLoginForm = (loginParams) => {
    
  const textFieldCss = {
    width: "100%"
  };

  const showPwdCss = {
    position: "absolute",
    right: "0px",
    top: "40px",
    cursor: "pointer"
  };

  const emailStatus = utils.emailValid(loginParams.email);
  const passwordStatus = utils.passwordValid(loginParams.password);
  const disableLogin = !(emailStatus.pass && passwordStatus.pass);
  
  return (
    <div>
      <div>
        <div className={s.description}>
          Kirjaudu sisään jollain alla olevista tavoista.
          Jos et ole käyttänyt palvelua aiemmin, tunnuksesi luodaan
          ensimmäisen kirjautumisen yhteydessä.
          <br/><br/>
          Kirjautumalla sovellukseen hyväksyt sovelluksen&nbsp;
          <a href="#">ehdot</a>.
        </div>
        <div className={s.extLogin}>
          <div className={s.fbLogin}>
            <a href="/login/fb">
              <div className={s.fbButton}>
                <img src={require("./FB-f-Logo__blue_50.png")} />
              </div>
              <div className={s.fbText}>
                <span>Kirjaudu Facebook-tunnuksilla</span>
              </div>
            </a>  
          </div>
          <div className={s.gLogin}>
            <a href="/login/google">
              <div className={s.gButton}>
                <img src={require("./btn_google.png")} />
              </div>
              <div className={s.gText}>
                Kirjaudu Google-tunnuksilla
              </div>
            </a>  
          </div>
        </div>
        <form action="/login" method="post" className={s.pwdLogin}>
          <div className={s.formTitle}>
            Kirjaudu sähköpostilla ja salasanalla
          </div>
          <div className={s.formItem}>
            <div className={s.formInput}>
              <TextField id="input-email"
                style={textFieldCss}
                name="email"
                floatingLabelText={emailStatus.text}
                floatingLabelStyle={emailStatus.style}
                value={loginParams.email} 
                onChange={() => {}} />
            </div>
          </div>
          <div className={s.formItem}>
            <div className={s.formInput} id="password">
              <TextField id="input-password"
                style={textFieldCss}
                type="password"
                name="password"
                floatingLabelText={passwordStatus.text}
                floatingLabelStyle={passwordStatus.style}
                value={loginParams.password}
                onChange={() => {}} /> 
              <div onClick={() => this._togglePassword()} style={showPwdCss}>
                <i className="material-icons">&#xE8F5;</i>
              </div>
            </div>
          </div>
          <div className={s.formSubmit}>  
            <div className={s.recoveryLink}>
              <a href="/login/recovery">
                Salasana unohtunut!
              </a>
            </div>
            <div className={s.submitButton}>
              <RaisedButton disabled={disableLogin}
                secondary={true} type="submit" label="Sisään">
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

function Login(props, context) {
  
  context.setTitle(title);
  
  const loginParams = {
    username: '',
    password: ''
  };
  
  const errorElem = null;
  const loginForm = renderLoginForm(loginParams);
 
  return (
    
    <div>
      <div className={s.root}>
        {errorElem}
        <div className={s.container}>
          {loginForm}
        </div>
      </div>
    </div>    
  
  );

}
    

Login.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Login);
