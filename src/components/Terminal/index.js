import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { getDateString, getLocalDateTimeValue, getTimeString } from '../utils';
import s from './Terminal.css';

import terminalMsg from '../EditCheckInItem/messages.terminal';
import Link from '../Link';
import cx from 'classnames';
import FontIcon from 'material-ui/FontIcon';

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

  const dateStr = terminal.localDateTime ? getDateString(getLocalDateTimeValue(terminal.localDateTime)) : '';
  const timeStr = terminal.localDateTime ? getTimeString(getLocalDateTimeValue(terminal.localDateTime)) : '';

  let priceAmount = terminal.priceTerminal ? terminal.priceTerminal.priceAmount : terminal.priceAmount;
  let priceCurrency = terminal.priceTerminal ? terminal.priceTerminal.priceCurrency : terminal.priceCurrency;

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
      <div className={s.terminalEntryRow2}>
        {
          terminal.transportId &&
            <div className={s.transportId}>
              { terminal.transportId }
            </div>
        }
        {
          priceAmount &&
            <div className={s.price}>
              <FontIcon className="material-icons" style={{ marginRight: '4px' }}>payment</FontIcon>
              { priceAmount } { priceCurrency }
            </div>
        }
      </div>
      {
        terminal.description &&
          <div className={s.terminalDescription}>
            { terminal.description }
          </div>
      }
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


