import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { saveTerminal } from '../../actions/posts';
import { resetPassword, saveProfile } from '../../actions/account';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Terminal.css';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from "material-ui/MenuItem";
import DatePicker from "material-ui/DatePicker";
import TimePicker from "material-ui/TimePicker";
import RaisedButton from 'material-ui/RaisedButton';
import { injectIntl, FormattedMessage } from 'react-intl';
import { getAvailableCurrencies } from '../../services/linkService';

import msg from './messages.terminal';
import {getClientId} from "../../core/utils";

const labels = {
  departure: {
    dateInputTitle: 'Date',
    timeInputTitle: 'Time',
    placeInputTitle: 'Departure description'
  },
  arrival: {
    dateInputTitle: 'Date',
    timeInputTitle: 'Time',
    placeInputTitle: 'Arrival description'
  }
}

const Terminal = (props) => {

  const {
    intl,
    checkIn,
    transportTypes,
    terminal,
    openTerminals,
    type,
    terminalProperties,
    saveDisabled,
    setProperty,
    saveTerminal
  } = props;

  const save  = () => {

    const editedTerminal = {
      checkInUuid: checkIn.uuid,
      type,
      transport,
      transportId,
      priceCurrency
    };

    if (terminal) {
      editedTerminal.uuid = terminal.uuid;
    }

    if (priceAmount && priceAmount.length > 0) {
      editedTerminal.priceAmount = parseFloat(priceAmount);
    }

    if (date) {
      editedTerminal.date = date.toISOString();
    }

    if (time) {
      editedTerminal.time = time.toISOString();
    }

    const clientId = getClientId();
    editedTerminal.clientId = clientId;

    console.log("save terminal", editedTerminal);
    saveTerminal({ terminal: editedTerminal });


  };

  console.log("terminal", props);
  const transportOptions = transportTypes.map(type => (
    <MenuItem id={type.slug} key={type.slug} style={{ "WebkitAppearance": "initial" }}
              value={type.slug} primaryText={intl.formatMessage(msg[type.slug])} />
  ));

  const currencyCodes = getAvailableCurrencies(checkIn.country);

  const currencies = Object.keys(currencyCodes).map(code => (
    <MenuItem key={code} style={{ "WebkitAppearance": "initial" }} value={code} primaryText={`${code}`} />
  ));

  const setTerminalProperty = (type, key, value) => {
    if (!terminalProperties[type]) terminalProperties[type] = {};
    terminalProperties[type][key] = value;
    setProperty('editTerminal.terminalProperties', { ...terminalProperties });
  };

  let transport, transportId, date, time, priceAmount, priceCurrency, linkedTerminalUuid;
  if (terminalProperties[type]) {
    transport = terminalProperties[type].transport;
    transportId = terminalProperties[type].transportId;
    date = terminalProperties[type].date;
    time = terminalProperties[type].time;
    priceAmount = terminalProperties[type].priceAmount;
    priceCurrency = terminalProperties[type].priceCurrency;
    linkedTerminalUuid = terminalProperties[type].linkedTerminalUuid;
  }

  const openTerminalOptions = (openTerminals || []).filter(terminal => (terminal.type === (type === 'arrival' ? 'departure' : 'arrival')))
    .map(terminal => {

    const pronoun = type === 'arrival' ? ' to ' : ' from ';
    const linkedTerminalLabel = intl.formatMessage(msg[terminal.transport]) + ' ' + terminal.transportId;

    const menuItemLabel = (
      <div className={s.terminalMenuItemLabel}>
        <div className={s.itemLabelRow}>
          <div className={s.terminalTransport}>
            { intl.formatMessage(msg[terminal.transport]) }
          </div>
          <p>
          { terminal.checkIn.formattedAddress }
          { terminal.checkIn.formattedAddress }
            { terminal.checkIn.formattedAddress }
            { terminal.checkIn.formattedAddress }
          </p>
        </div>
        <div className={s.terminalTransportId}>
          { terminal.transportId }
        </div>
      </div>
    );

    return (
      <MenuItem id={terminal.uuid} key={terminal.uuid} style={{ wdith: '100%', "WebkitAppearance": "initial" }}
                value={terminal.uuid} primaryText={menuItemLabel}>
      </MenuItem>
    );

  });

  const linkedTerminalLabel = type === 'arrival' ? 'Departing from' : 'Going to';

  return (
    <div>
      <div id="terminal-page-one" className={s.terminalPageOne}>
        <div className={s.pageOneContainer}>
          <div className={s.inputRow0}>
            <div className={s.linkedTerminal}>
              <SelectField id="linked-terminal-select"
                           fullWidth={true}
                           value={linkedTerminalUuid || ((openTerminals && openTerminals.length > 0) && openTerminals[0].uuid)}
                           onChange={(event, index, value) => setTerminalProperty(type, 'linkedTerminalUuid', value)}
                           floatingLabelText={linkedTerminalLabel}
                           floatingLabelFixed={true}
                           hintText="Select terminal"
                           labelStyle={{ "height": "initial" }}
                           style={{ "height": "initial" }}>
                {openTerminalOptions}
              </SelectField>
            </div>
          </div>
          <div className={s.inputRow1}>
            <div className={s.transport}>
              <SelectField id="transport-select"
                           fullWidth={true}
                           value={transport || terminal.transport}
                           onChange={(event, index, value) => setTerminalProperty(type, 'transport', value)}
                           floatingLabelText="Transport"
                           floatingLabelFixed={true}
                           hintText="Select type">
                {transportOptions}
              </SelectField>
            </div>
            <div className={s.dateTime}>
              <div className={s.date}>
                <DatePicker id={`${type}-date-picker`}
                            hintText={labels[type].dateInputTitle}
                            value={date || terminal.date || new Date()}
                            floatingLabelText="Arrival date"
                            floatingLabelFixed={true}
                            autoOk={true}
                            fullWidth={true}
                            onChange={(event, value) => setTerminalProperty(type, 'date', value)}
                />
              </div>
              <div className={s.time}>
                <TimePicker id={`${type}-time-picker`}
                            format="24hr"
                            hintText={labels[type].timeInputTitle}
                            value={time || terminal.time || new Date()}
                            floatingLabelText="Time"
                            floatingLabelFixed={true}
                            autoOk={true}
                            fullWidth={true}
                            onChange={(event, value) => setTerminalProperty(type, 'time', value)}
                />
              </div>
            </div>
          </div>
          <div className={s.inputRow2}>
            <div className={s.transportId}>
              <TextField id="transport-id"
                         value={transportId || terminal.transportId || ''}
                         fullWidth={true}
                         floatingLabelText="Transport ID"
                         floatingLabelFixed={true}
                         onChange={(e) => setTerminalProperty(type, 'transportId', e.target.value)}
                         hintText={(!transportId) ? "Number, company..." : null}
              />
            </div>
          </div>
          <div className={s.inputRow3}>
            <div className={s.cost}>
              <div className={s.amount}>
                <TextField id="price-amount-input"
                           style={ { width: '100%'} }
                           value={priceAmount || terminal.priceAmount || ''}
                           floatingLabelText="Cost"
                           hintText="Price"
                           floatingLabelFixed={true}
                           onChange={(e) => setTerminalProperty(type, 'priceAmount', e.target.value)}
                />
              </div>
              <div className={s.currency}>
                <SelectField id="currency-select"
                             style={ { width: '100%'} }
                             value={priceCurrency || terminal.priceCurrency}
                             floatingLabelText="Currency"
                             onChange={(event, index, value) => setTerminalProperty(type, 'priceCurrency', value)}>
                  {currencies}
                </SelectField>
              </div>
            </div>
            <div className={s.controls}>
              <RaisedButton label="OK" fullWidth={true} disabled={saveDisabled} onClick={() => save()} />
            </div>
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
    terminalProperties: state.editTerminal.terminalProperties || {},
    saveDisabled: state.editTerminal.saveDisabled
  }), {
    setProperty, saveTerminal
  })(withStyles(s)(Terminal))
);
