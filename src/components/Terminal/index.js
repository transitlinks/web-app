import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { getDateString, getTimeString } from '../utils';
import s from './Terminal.css';

import terminalMsg from '../EditCheckInItem/messages.terminal';
import Link from '../Link';

const Terminal = ({
  terminal, env
}) => {

  let linkedTerminalAddress = null;
  if (terminal.linkedTerminal) {
    const direction = terminal.type === 'departure' ? 'To' : 'From';
      linkedTerminalAddress = (
        <div className={s.terminalEntryAddress}>
          { direction }:&nbsp;
          <Link to={`/check-in/${terminal.linkedTerminal.checkIn.uuid}`}>{ terminal.linkedTerminal.checkIn.formattedAddress }</Link>
        </div>
      );
  }

  const dateStr = terminal.date ? getDateString(terminal.date) : '';
  const timeStr = terminal.time ? getTimeString(terminal.time) : '';

  return (
    <div className={s.terminalEntry}>
      <div className={s.terminalEntryRow1}>
        <div className={s.terminalEntryTransport}>
          { terminalMsg[terminal.transport] && <FormattedMessage {...terminalMsg[terminal.transport]} /> }
        </div>
        <div className={s.terminalEntryTime}>
          { dateStr } { timeStr }
        </div>
      </div>
      <div className={s.terminalEntryTransportId}>
        { terminal.transportId }
      </div>
      { linkedTerminalAddress }
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    env: state.env
  }), {
  })(withStyles(s)(Terminal))
);


