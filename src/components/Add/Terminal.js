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


  console.log("terminal", props);
  const transportOptions = transportTypes.map(type => (
    <MenuItem id={type.slug} key={type.slug} style={{ "WebkitAppearance": "initial" }}
              value={type.slug} primaryText={intl.formatMessage(msg[type.slug])} />
  ));

  const currencyCodes = getAvailableCurrencies(checkIn.country);

  const currencies = Object.keys(currencyCodes).map(code => (
    <MenuItem key={code} style={{ "WebkitAppearance": "initial" }} value={code} primaryText={`${code}`} />
  ));

  const setTerminalProperties = (type, keys, values) => {
    if (!terminalProperties[type]) terminalProperties[type] = {};
    keys.forEach((key, i) => {
      terminalProperties[type][key] = values[i];
    });
    setProperty('editTerminal.terminalProperties', { ...terminalProperties });
  };

  const typedOpenTerminals = openTerminals.filter(terminal => terminal.type === (type === 'arrival' ? 'departure' : 'arrival'));

  const openTerminalOptions = typedOpenTerminals.map(terminal => {

    const pronoun = type === 'arrival' ? ' to ' : ' from ';
    const linkedTerminalLabel = intl.formatMessage(msg[terminal.transport]) + ' ' + terminal.transportId;

    const menuItemLabel = (
      <div className={s.terminalMenuItemLabel}>
        <div className={s.itemLabelRow}>
          <div className={s.terminalTransport}>
            { intl.formatMessage(msg[terminal.transport]) }
          </div>
          <p className={s.terminalTransportId}>
            { terminal.transportId }
          </p>
        </div>
        <div className={s.terminalAddress}>
          { terminal.checkIn.formattedAddress }
        </div>
      </div>
    );

    console.log("adding menu item", terminal);
    return (
      <MenuItem id={terminal.uuid} key={terminal.uuid} style={{ wdith: '100%', "WebkitAppearance": "initial" }}
                value={terminal.uuid} primaryText={menuItemLabel}>
      </MenuItem>
    );

  });

  if (openTerminalOptions.length > 0) {
    const itemElem = (
      <div className={s.terminalMenuItemLabel}>
        <div className={s.notLinked}>
          NOT LINKED
        </div>
      </div>
    );
    const notLinkedItem = (
      <MenuItem id={'not-linked'} key={'not-linked'} style={{ wdith: '100%', "WebkitAppearance": "initial" }}
                value={'not-linked'} primaryText={itemElem}>
      </MenuItem>
    );
    openTerminalOptions.unshift(notLinkedItem);
  }

  let linkedTerminalUuid = null;
  if(terminalProperties[type] && terminalProperties[type].linkedTerminalUuid) {
    linkedTerminalUuid = terminalProperties[type].linkedTerminalUuid;
  }

  
  let linkedTerminal = null;
  if (linkedTerminalUuid !== 'not-linked') {
    if (typedOpenTerminals.length > 0) {
      linkedTerminal = typedOpenTerminals.filter(terminal => terminal.uuid === (linkedTerminalUuid || typedOpenTerminals[0].uuid))[0];
    }
  }

  const getTerminalProperty = (key) => {
    if (!terminalProperties[type] || terminalProperties[type][key] === null) {
      if (linkedTerminalUuid !== 'not-linked' && linkedTerminal) {
        return linkedTerminal[key];
      }
      return null;
    }
    return terminalProperties[type][key];
  }

  let transport = getTerminalProperty('transport');
  let transportId = getTerminalProperty('transportId');
  let date = getTerminalProperty('date');
  let time = getTerminalProperty('time');
  let priceCurrency = getTerminalProperty('priceCurrency');
  let priceAmount = getTerminalProperty('priceAmount');

  const linkedTerminalLabel = type === 'arrival' ? 'Link to departure' : 'Link to arrival';

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

    if (linkedTerminalUuid !== 'not-linked' && linkedTerminal) {
      editedTerminal.linkedTerminalUuid = linkedTerminalUuid;
    }

    const clientId = getClientId();
    editedTerminal.clientId = clientId;

    console.log("save terminal", editedTerminal);
    saveTerminal({ terminal: editedTerminal });


  };


  return (
    <div>
      <div id="terminal-page-one" className={s.terminalPageOne}>
        <div className={s.pageOneContainer}>
          {
            openTerminalOptions.length > 0 &&
            <div className={s.inputRow0}>
              <div className={s.linkedTerminal}>
                <SelectField id="linked-terminal-select"
                             fullWidth={true}
                             value={linkedTerminalUuid || ((typedOpenTerminals && typedOpenTerminals.length > 0) && typedOpenTerminals[0].uuid)}
                             onChange={(event, index, value) => setTerminalProperties(type,
                               ['linkedTerminalUuid', 'transport', 'transportId', 'date', 'time', 'priceAmount', 'priceCurrency'],
                               [value, null, null, null, null, null, null])}
                             floatingLabelText={linkedTerminalLabel}
                             floatingLabelFixed={true}
                             hintText="Select terminal"
                             labelStyle={{ "height": "initial" }}
                             style={{ "height": "initial" }}>
                  {openTerminalOptions}
                </SelectField>
              </div>
            </div>
          }
          <div className={s.inputRow1}>
            <div className={s.transport}>
              <SelectField id="transport-select"
                           fullWidth={true}
                           value={transport || terminal.transport}
                           onChange={(event, index, value) => setTerminalProperties(type, ['transport'], [value])}
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
                            onChange={(event, value) => setTerminalProperties(type, ['date'], [value])}
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
                            onChange={(event, value) => setTerminalProperties(type, ['time'], [value])}
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
                         onChange={(e) => setTerminalProperties(type, ['transportId'], [e.target.value])}
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
                           onChange={(e) => setTerminalProperties(type, ['priceAmount'], [e.target.value])}
                />
              </div>
              <div className={s.currency}>
                <SelectField id="currency-select"
                             style={ { width: '100%'} }
                             value={priceCurrency || terminal.priceCurrency}
                             floatingLabelText="Currency"
                             onChange={(event, index, value) => setTerminalProperties(type, ['priceCurrency'], [value])}>
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
