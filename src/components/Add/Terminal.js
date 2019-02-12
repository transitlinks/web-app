import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { saveTerminal } from '../../actions/posts';
import { resetPassword, saveProfile } from '../../actions/account';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Terminal.css';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import EmailInput from '../EmailInput';
import PasswordInput from '../PasswordInput';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages.terminal';

const Terminal = ({
  intl,
  terminal,
  type,
  transport,
  transportId,
  setProperty,
  saveTerminal
}) => {

  const save  = () => {

    const editedTerminal = {
      type,
      transport,
      transportId
    };

    saveTerminal(editedTerminal);

  };

  return (
    <div>
      <div id="terminal-page-one" className={s.terminalPageOne}>
        <div>
          <div className={s.transportId}>
            <TextField id="transport-id"
                       value={transportId}
                       fullWidth={true}
                       onChange={(e) => setProperty('editTerminal.transportId', e.target.value)}
                       hintText={(!transportId) ? "Number, transport company..." : null}
            />
          </div>
        </div>
      </div>
      <div>
      </div>
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    transport: state.editTerminal.transport,
    transportId: state.editTerminal.transportId
  }), {
    setProperty, saveTerminal
  })(withStyles(s)(Terminal))
);
