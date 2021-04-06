import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ResetPassword.css';
import { connect } from "react-redux";
import { setProperty } from "../../actions/properties";
import { requestResetPassword, codeResetPassword } from '../../actions/account';
import PasswordInput from '../../components/PasswordInput';
import RaisedButton from 'material-ui/RaisedButton';
import { emailValid } from '../../core/utils';
import EmailInput from '../../components/EmailInput';

const title = 'Transitlinks - Reset password';

class ResetPassword extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {

  }

  render() {


    const { context, props } = this;
    context.setTitle(title);

    const { email, code } = props;

    const handleEmailChange = (input) => {
      this.props.setProperty('profile-email', { email: input.value, valid: input.pass });
    };

    const handlePasswordChange = (input) => {
      this.props.setProperty('profile-password', { password: input.value, valid: input.pass });
    };

    if (!code) {
      if (!this.props.requestResult) {
        return (
          <div className={s.root}>
            <div className={s.resetPasswordText}>
              Request password reset for email:
            </div>
            <div className={s.requestResetInput}>
              <div className={s.emailInput}>
                <EmailInput id="profile-email" name="profile-email" value={this.props.requestEmail || ''} onChange={handleEmailChange} />
              </div>
              <div className={s.requestButton}>
                <RaisedButton disabled={!emailValid(this.props.requestEmail).pass}
                              label={'Request'}
                              onClick={() => this.props.requestResetPassword(this.props.requestEmail)} />
              </div>
            </div>
          </div>
        );
      } else if (this.props.requestResult === 'ERROR') {
        return (
          <div className={s.root}>
            <div className={s.resetPasswordText}>
              Password reset request failed. Please, try again later!
            </div>
          </div>
        );
      } else {
        return (
          <div className={s.root}>
            <div className={s.resetPasswordText}>
              Password reset link has ben sent to {this.props.requestResult}.
            </div>
          </div>
        );
      }

    } else if (email) {
      if (!this.props.resetResult) {
        return (
          <div className={s.root}>
            <div className={s.resetPasswordText}>
              Reset password for:
            </div>
            <div className={s.resetPasswordEmail}>
              {email}
            </div>
            <div className={s.resetPasswordInput}>
              <div className={s.resetPasswordTextField}>
                <PasswordInput id="reset-password-input"
                               name="profile-password"
                               value={this.props.password || ''}
                               onChange={handlePasswordChange} />
              </div>
              <div className={s.resetButton}>
                <RaisedButton disabled={!(this.props.password)}
                              label={'Reset'}
                              onClick={() => this.props.codeResetPassword(code, this.props.password)} />
              </div>
            </div>
          </div>
        );
      } else if (this.props.resetResult === 'ERROR') {
        return (
          <div className={s.root}>
            <div className={s.resetPasswordText}>
              Failed to reset password. Please, try again later!
            </div>
          </div>
        );
      } else {
        return (
          <div className={s.root}>
            <div className={s.resetPasswordText}>
              Password reset successful! You may now log in with the new password.
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className={s.root}>
          <div className={s.resetPasswordText}>
            Invalid password reset code
          </div>
        </div>
      );
    }


  }

};

ResetPassword.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  password: state.profile.password,
  requestEmail: state.profile.email,
  emailValid: state.profile.emailValid,
  requestResult: state.profile.requestResetPassword,
  resetResult: state.profile.codeResetPassword
}), {
  setProperty,
  requestResetPassword,
  codeResetPassword
})(withStyles(s)(ResetPassword));

