import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { saveTerminal, getTerminal } from '../../actions/posts';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Terminal.css';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import RaisedButton from 'material-ui/RaisedButton';
import { injectIntl } from 'react-intl';
import { getAvailableCurrencies } from '../../services/linkService';

import msg from './messages.terminal';
import { getClientId, getPaddedDate, getPaddedTime } from '../../core/utils';
import FontIcon from 'material-ui/FontIcon';
import { getLocalDateTimeValue } from '../utils';

const labels = {
  departure: {
    dateInputTitle: 'Departure date',
    timeInputTitle: 'Time',
    placeInputTitle: 'Departure description'
  },
  arrival: {
    dateInputTitle: 'Arrival date',
    timeInputTitle: 'Time',
    placeInputTitle: 'Arrival description'
  }
}

const Terminal = ({
  intl, checkIn, transportTypes, openTerminals, type, editTerminal, userDepartures, priceTerminal,
  saveDisabled, setProperty, saveTerminal, getTerminal, terminalInputErrors
}) => {

  const transportOptions = transportTypes.map(type => (
    <MenuItem id={type.slug} key={type.slug} style={{ 'WebkitAppearance': 'initial' }}
              value={type.slug} primaryText={intl.formatMessage(msg[type.slug])} />
  ));

  const currencyCodes = getAvailableCurrencies(checkIn.country);

  const currencies = Object.keys(currencyCodes).map(code => (
    <MenuItem key={code} style={{ 'WebkitAppearance': 'initial' }} value={code} primaryText={`${code}`} />
  ));

  const setTerminalProperty = (name, value) => {
    setProperty('editTerminal.terminal', { ...editTerminal, [name]: value });
  };

  const typedOpenTerminals = (openTerminals || []).filter(terminal => (terminal.type === (type === 'arrival' ? 'departure' : 'arrival') && terminal.checkIn.uuid !== checkIn.uuid));

  const openTerminalOptions = typedOpenTerminals.map(terminal => {
    const menuItemLabel = (
      <div className={s.terminalMenuItemLabel}>
        <div className={s.itemLabelRow}>
          <div className={s.terminalTransport}>
            { terminal.transport && intl.formatMessage(msg[terminal.transport]) }
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

    return (
      <MenuItem id={terminal.uuid} key={terminal.uuid} style={{ wdith: '100%', 'WebkitAppearance': 'initial' }}
                value={terminal.uuid} primaryText={menuItemLabel}>
      </MenuItem>
    );

  });


  let linkedTerminalUuid = null;
  if (editTerminal.linkedTerminalUuid) {
    linkedTerminalUuid = editTerminal.linkedTerminalUuid;
  } else {
    if (typedOpenTerminals.length > 0) {
      linkedTerminalUuid = typedOpenTerminals[0].uuid;
    }
  }

  let linkedTerminal = null;
  if (linkedTerminalUuid !== 'not-linked') {
    if (typedOpenTerminals.length > 0) {
      linkedTerminal = (typedOpenTerminals || []).filter(terminal => terminal.uuid === (linkedTerminalUuid || typedOpenTerminals[0].uuid))[0];
    }
  }

  const now = new Date();

  const linkedTerminalLabel = type === 'arrival' ? 'Link to departure' : 'Link to arrival';


  const getDefaultTerminalTime = () => {
    const checkInDateTime = new Date(checkIn.date);
    const timeDiff = Math.abs(now.getTime() - checkInDateTime.getTime());
    return (timeDiff < 1000 * 60 * 60 * 48) ? now : checkInDateTime;
  };

  const defaultDateTime = (linkedTerminal && !editTerminal.uuid) ?
    new Date(editTerminal.localDateTime || getDefaultTerminalTime()) :
    new Date(editTerminal.localDateTime || getDefaultTerminalTime());

  const dateTime = ({ date, time }) => {
    const newDate = date ? getPaddedDate(date) : getPaddedDate(editTerminal.localDateTime ? new Date(editTerminal.localDateTime) : defaultDateTime);
    const newTime = time ? getPaddedTime(time) : getPaddedTime(editTerminal.localDateTime ? new Date(editTerminal.localDateTime) : defaultDateTime);
    return newDate + 'T' + newTime;
  };

  const transportValue = editTerminal.transport || (priceTerminal ? priceTerminal.transport : undefined);
  const transportIdValue = (editTerminal.transportId || (priceTerminal || {}).transportId) || '';
  const descriptionValue = (editTerminal.description || (priceTerminal || {}).description) || '';

  let priceTerminalUuidValue = editTerminal.priceTerminalUuid ||
    (editTerminal.priceTerminal ? editTerminal.priceTerminal.uuid : undefined) ||
    ((userDepartures && userDepartures.length > 0) ? userDepartures[0].uuid : undefined);
  console.log('editTerminal', priceTerminalUuidValue, userDepartures, transportValue);
  const save = () => {

    if (!transportValue && !linkedTerminal) {
      setProperty('editTerminal.terminalInputErrors', {
        transport: 'empty'
      });
      return;
    }

    const editedTerminal = {
      uuid: editTerminal.uuid,
      checkInUuid: checkIn.uuid,
      type,
      transport: transportValue,
      transportId: transportIdValue,
      description: descriptionValue,
      priceCurrency: editTerminal.priceCurrency,
      priceType: editTerminal.priceType || 'payment',
      priceTerminalUuid: editTerminal.priceType === 'part' ? priceTerminalUuidValue : null
    };

    if (editTerminal.priceAmount && editTerminal.priceAmount.length > 0) {
      editedTerminal.priceAmount = parseFloat(editTerminal.priceAmount);
    }

    editedTerminal.date = editTerminal.localDateTime || dateTime({ date: defaultDateTime, time: defaultDateTime });

    if (linkedTerminalUuid !== 'not-linked' && linkedTerminal) {
      editedTerminal.linkedTerminalUuid = linkedTerminalUuid;
      editedTerminal.transport = linkedTerminal.transport;
      editedTerminal.transportId = linkedTerminal.transactionId;
    }

    const clientId = getClientId();
    editedTerminal.clientId = clientId;

    saveTerminal({ terminal: editedTerminal });


  };

  return (
    <div>
      <div id="terminal-page-one" className={s.terminalPageOne}>
        <div className={s.pageOneContainer}>
          {
            (!editTerminal.uuid && openTerminalOptions.length > 0) &&
            <div className={s.inputRow0}>
              <div className={s.linkedTerminal}>
                <SelectField id="linked-terminal-select"
                             value={linkedTerminalUuid || ((typedOpenTerminals && typedOpenTerminals.length > 0) && typedOpenTerminals[0].uuid)}
                             fullWidth
                             floatingLabelFixed
                             floatingLabelText={linkedTerminalLabel}
                             hintText="Select terminal"
                             labelStyle={{ height: 'initial' }}
                             style={{ height: 'initial' }}
                             onChange={(event, index, value) => setProperty('editTerminal.terminal', { ...editTerminal, linkedTerminalUuid: value })}>
                  {openTerminalOptions}
                </SelectField>
              </div>
            </div>
          }
          {

            (linkedTerminal && !editTerminal.uuid) ?
              <div className={s.linkedTerminalContent}>
                <div className={s.linkedRow1}>
                  <div className={s.linkedControls}>
                    <div className={s.editArrival}>
                      <FontIcon className="material-icons" style={{ fontSize: '24px' }}>edit</FontIcon>
                    </div>
                    <RaisedButton label="LINK" fullWidth disabled={saveDisabled} onClick={() => save()} />
                  </div>
                  <div className={s.linkedDateTime}>
                    <div className={s.date}>
                      <DatePicker id={`${type}-date-picker`}
                                  value={
                                    editTerminal.localDateTime ?
                                      getLocalDateTimeValue(editTerminal.localDateTime) :
                                      defaultDateTime
                                  }
                                  autoOk
                                  fullWidth
                                  floatingLabelFixed
                                  floatingLabelStyle={{ width: '120px' }}
                                  floatingLabelText={labels[type].dateInputTitle}
                                  hintText={labels[type].dateInputTitle}
                                  onChange={(event, value) => setTerminalProperty('localDateTime', dateTime({ date: value }))} />
                    </div>
                    <div className={s.time}>
                      <TimePicker id={`${type}-time-picker`}
                                  value={
                                    editTerminal.localDateTime ?
                                      getLocalDateTimeValue(editTerminal.localDateTime) :
                                      defaultDateTime
                                  }
                                  format="24hr"
                                  autoOk
                                  fullWidth
                                  floatingLabelFixed
                                  floatingLabelText="Time"
                                  hintText={labels[type].timeInputTitle}
                                  onChange={(event, value) => setTerminalProperty('localDateTime', dateTime({ time: value }))} />
                    </div>
                  </div>
                </div>
              </div> :
              <div>
                <div className={s.inputRow1}>
                  <div className={s.transport}>
                    <SelectField id="transport-select"
                                 value={transportValue}
                                 fullWidth
                                 floatingLabelFixed
                                 floatingLabelText="Transport"
                                 hintText="Select type"
                                 errorText={(terminalInputErrors && terminalInputErrors.transport) && 'Select transport'}
                                 onChange={(event, index, value) => {
                                   setProperty('editTerminal.terminalInputErrors', null);
                                   setTerminalProperty('transport', value);
                                 }}>
                      {transportOptions}
                    </SelectField>
                  </div>
                  <div className={s.dateTime}>
                    <div className={s.date}>
                      <DatePicker id={`${type}-date-picker`}
                                  value={editTerminal.localDateTime ? new Date(editTerminal.localDateTime) : defaultDateTime}
                                  floatingLabelStyle={{ width: '120px' }}
                                  floatingLabelText={labels[type].dateInputTitle}
                                  floatingLabelFixed
                                  fullWidth
                                  autoOk
                                  onChange={(event, value) => setTerminalProperty('localDateTime', dateTime({ date: value }))} />
                    </div>
                    <div className={s.time}>
                      <TimePicker id={`${type}-time-picker`}
                                  value={editTerminal.localDateTime ? new Date(editTerminal.localDateTime) : defaultDateTime}
                                  format="24hr"
                                  floatingLabelText="Time"
                                  floatingLabelFixed
                                  fullWidth
                                  autoOk
                                  onChange={(event, value) => setTerminalProperty('localDateTime', dateTime({ time: value }))} />
                    </div>
                  </div>
                </div>
                <div className={s.inputRow2}>
                  <div className={s.transportId}>
                    <TextField id="transport-id"
                               value={transportIdValue}
                               fullWidth
                               floatingLabelFixed
                               floatingLabelText="Transport ID"
                               hintText={!editTerminal.transportId ? 'Number, company...' : null}
                               onChange={(e) => setTerminalProperty('transportId', e.target.value)}
                    />
                  </div>
                </div>
                <div className={s.inputRow2}>
                  <div className={s.transportId}>
                    <TextField id="description"
                               value={descriptionValue}
                               fullWidth
                               floatingLabelFixed
                               floatingLabelText="Description"
                               hintText={(!editTerminal.description) ? 'Other info' : null}
                               onChange={(e) => setTerminalProperty('description', e.target.value)}
                    />
                  </div>
                </div>
                <div className={s.inputRow3}>
                  {
                    (userDepartures && userDepartures.length > 0) &&
                    <div className={s.priceTypeSelection}>
                      <div className={s.priceType}>
                        <FontIcon className="material-icons" style={{ fontSize: '20px', color: editTerminal.priceType !== 'part' ? '#0074c2' : 'black' }} onClick={() => {
                          setTerminalProperty('priceType', 'payment');
                        }}>payment</FontIcon>
                      </div>
                      <div className={s.priceType}>
                        <FontIcon className="material-icons" style={{ fontSize: '20px', color: editTerminal.priceType === 'part' ? '#0074c2' : 'black' }} onClick={() => {
                          setTerminalProperty('priceType', 'part');
                          //setTerminalProperty('priceTerminalUuid', userDepartures[0].uuid);
                          getTerminal(priceTerminal ? priceTerminal.uuid : userDepartures[0].uuid);
                        }}>dehaze</FontIcon>
                      </div>
                    </div>
                  }
                  {
                    editTerminal.priceType === 'part' ?
                      <div>
                        <SelectField value={priceTerminalUuidValue}
                                     style={{ width: '100%' }}
                                     floatingLabelText="Part of total cost"
                                     onChange={(event, index, value) => {
                                       setTerminalProperty('priceTerminalUuid', value);
                                       getTerminal(value);
                                     }}>
                          {(userDepartures || []).filter(dep => dep.uuid !== editTerminal.uuid).map(dep => {
                            let priceTerminalText = dep.transport + ' from ' + dep.locality;
                            if (dep.priceAmount) {
                              priceTerminalText += ' ' + dep.priceAmount + ' ' + dep.priceCurrency;
                            }

                            return (
                              <MenuItem id={`price-terminal-${dep.uuid}`}
                                        key={`price-terminal-${dep.uuid}`}
                                        value={dep.uuid}
                                        primaryText={priceTerminalText}>
                              </MenuItem>
                            );
                          })}
                        </SelectField>
                      </div> :
                      <div className={s.cost}>
                        <div className={s.amount}>
                          <TextField id="price-amount-input"
                                     value={editTerminal.priceAmount || ''}
                                     style={{ width: '100%' }}
                                     floatingLabelFixed
                                     floatingLabelText="Cost"
                                     hintText="Price"
                                     onChange={(e) => {
                                       setTerminalProperty('priceAmount', e.target.value);
                                     }}
                          />
                        </div>
                        <div className={s.currency}>
                          <SelectField id="currency-select"
                                       value={editTerminal.priceCurrency}
                                       style={{ width: '100%' }}
                                       floatingLabelText="Currency"
                                       onChange={(event, index, value) => setTerminalProperty('priceCurrency', value)}>
                            {currencies}
                          </SelectField>
                        </div>
                      </div>

                  }
                  <div className={s.controls}>
                    <RaisedButton label="OK" fullWidth disabled={saveDisabled} onClick={() => save()} />
                  </div>
                </div>
              </div>

          }
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
    editTerminal: state.editTerminal.terminal || {},
    saveDisabled: state.editTerminal.saveDisabled,
    terminalInputErrors: state.editTerminal.terminalInputErrors,
    userDepartures: state.posts.userDepartures,
    priceTerminal: state.editTerminal.priceTerminal
  }), {
    setProperty, saveTerminal, getTerminal
  })(withStyles(s)(Terminal))
);
