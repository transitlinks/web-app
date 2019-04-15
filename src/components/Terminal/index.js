import React from 'react';
import cx from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas, getDateString, getTimeString } from '../utils';
import s from './Terminal.css';
import FontIcon from 'material-ui/FontIcon';
import { setProperty } from "../../actions/properties";
import { getFeedItem } from "../../actions/posts";

import terminalMsg from '../Add/messages.terminal';

const Terminal = ({
  terminal, env
}) => {

  let linkedTerminalAddress = null;
  if (terminal.linkedTerminal) {
    const direction = terminal.type === 'departure' ? 'To' : 'From';
      linkedTerminalAddress = (
        <div className={s.terminalEntryAddress}>
          { direction }:&nbsp;
          <a href="">{ terminal.linkedTerminal.checkIn.formattedAddress }</a>
        </div>
      );
  }

  const dateStr = terminal.date ? getDateString(terminal.date) : '';
  const timeStr = terminal.time ? getTimeString(terminal.time) : '';

  return (
    <div className={s.terminalEntry}>
      <div className={s.terminalEntryRow1}>
        <div className={s.terminalEntryTransport}>
          <FormattedMessage {...terminalMsg[terminal.transport]} />
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


