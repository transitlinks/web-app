import React from 'react';
import { connect } from 'react-redux';
import {
  saveCheckIn,
  deleteCheckIn,
  setTransport,
  setProperty
} from '../../actions/editCheckIn';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditCheckIn.css';
import cc from 'currency-codes';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import Rating from 'react-rating';
import LocalityAutocomplete from './LocalityAutocomplete';
import Terminal from './Terminal';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const EditCheckIn = ({
  intl,
  saveCheckIn, deleteCheckIn, setTransport, setProperty,
  checkIn, transportTypes,
  uuid,
  user,
  from, to,
  transport,
  identifier,
  mode,
  departure,
  departureDate, departureTime, departureDescription,
  arrival,
  arrivalDate, arrivalTime, arrivalDescription,
  priceAmount, priceCurrency,
  description,
  availabilityRating, departureRating, arrivalRating, awesomeRating
}) => {

  let departureValue = {};
  let arrivalValue = {};
  if ((uuid && checkIn) || (departure && arrival)) {

    departureValue = departure || {
      lat: checkIn.departureLat,
      lng: checkIn.departureLng,
      description: checkIn.departureAddress
    };

    arrivalValue = arrival || {
      lat: checkIn.arrivalLat,
      lng: checkIn.arrivalLng,
      description: checkIn.arrivalAddress
    };

  }

  const toLocalDate = (date) => {
    const addZ = n => (n < 10 ? '0' : '') + n;
    return date.getFullYear() + '-' +
      addZ(date.getMonth() + 1) + '-' +
      addZ(date.getDate());
  }

  const mergeNonNull = (obj1, obj2) => {
    Object.keys(obj2).forEach(key => {
      if (obj2[key]) obj1[key] = obj2[key];
    });
    return obj1;
  };

  const onSave = () => {

    const departureDateJson = departureDate ? toLocalDate(departureDate) : null;
    const departureHour = departureTime ? departureTime.getHours() : null;
    const departureMinute = departureTime ? departureTime.getMinutes() : null;

    const arrivalDateJson = arrivalDate ? toLocalDate(arrivalDate) : null;
    const arrivalHour = arrivalTime ? arrivalTime.getHours() : null;
    const arrivalMinute = arrivalTime ? arrivalTime.getMinutes() : null;

    saveCheckIn({ checkIn: mergeNonNull({
      mode,
      from: from.apiId, to: to.apiId,
      transport, identifier
    }, {
      uuid,
      departureDate: departureDateJson,
      departureHour, departureMinute, departureDescription,
      departureAddress: departureValue.description,
      departureLat: departureValue.lat, departureLng: departureValue.lng,
      arrivalDate: arrivalDateJson,
      arrivalHour, arrivalMinute, arrivalDescription,
      arrivalAddress: arrivalValue.description,
      arrivalLat: arrivalValue.lat, arrivalLng: arrivalValue.lng,
      priceAmount: parseFloat(priceAmount), priceCurrency,
      description,
      availabilityRating, departureRating, arrivalRating, awesomeRating
    })});
  };

  const onDelete = () => {
    deleteCheckIn(uuid);
  };

  const onChangeProperty = (property) => {
    return (event, value, selectValue) => {
      setProperty(property, selectValue || value);
    };
  };

  const onChangeTransport = (event, index, value) => {
    setTransport(value);
  };

  const onChangeRating = (name) => {
    return (rating) => {
      setProperty(`${name}Rating`, rating);
    }
  };

  const transportOptions = transportTypes.map(type => (
    <MenuItem id={type.slug} key={type.slug} style={{ "WebkitAppearance": "initial" }}
      value={type.slug} primaryText={intl.formatMessage(msg[type.slug])} />
  ));

  const modeOptions = [
    <MenuItem id="mode-research" key="mode-research"
      style={{ "WebkitAppearance": "initial" }}
      value={'research'} primaryText={intl.formatMessage(msg['research'])} />,
    <MenuItem id="mode-experience" key="mode-experience"
      style={{ "WebkitAppearance": "initial" }}
      value={'experience'} primaryText={intl.formatMessage(msg['experience'])} />
  ];

  const currencyCodes = {
  };

  const countries = cc.countries();

  if (from) {
    const matchingCountries = countries.filter(country => country.indexOf(from.countryLong) !== -1);
    if (matchingCountries.length > 0) {
      cc.country(matchingCountries[0]).forEach(currency => {
        currencyCodes[currency.code] = currency;
      });
    }
  }

  if (to) {
    const matchingCountries = countries.filter(country => country.indexOf(to.countryLong) !== -1);
    if (matchingCountries.length > 0) {
      cc.country(matchingCountries[0]).forEach(currency => {
        currencyCodes[currency.code] = currency;
      });
    }
  }

  currencyCodes['USD'] = cc.code('USD');
  currencyCodes['EUR'] = cc.code('EUR');
  currencyCodes['GBP'] = cc.code('GBP');

  const currencies = Object.keys(currencyCodes).map(code => (
    <MenuItem key={code} style={{ "WebkitAppearance": "initial" }} value={code} primaryText={`${code} ${currencyCodes[code].currency}`} />
  ));

  const ratingCss = {
    'display': 'inline-block',
    'borderRadius': '50%',
    'border': '5px double white',
    'width': '20px',
    'height': '20px',
  };

  const ratingEmptyCss = Object.assign({
    'backgroundColor': '#f0f0f0'
  }, ratingCss);
  const ratingFullCss = Object.assign({
    'backgroundColor': 'black'
  }, ratingCss);


  const ratingStyles = {
    empty: ratingEmptyCss,
    full: ratingFullCss
  };

  const saveDisabled = !(from && to && transport);
  const additionalHidden = {
    display: (from && to && transport) ? 'block' : 'none'
  };

  let fromInputValue = '';
  let toInputValue = '';
  if (uuid && from && to) {
    fromInputValue = from.description;
    toInputValue = to.description;
  }

  console.log("edit check-in", uuid, from, to, fromInputValue, checkIn, departure, arrival, departureValue, arrivalValue);
  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <div className={s.titleText}>
            <FormattedMessage {...msg.addLink} />
          </div>
          <div className={s.mode}>
            <SelectField id="mode-select"
              value={mode || 'research'}
              fullWidth={true}
              onChange={onChangeProperty('mode')}
              floatingLabelText="Info type"
              floatingLabelFixed={true}>
              {modeOptions}
            </SelectField>
          </div>
        </div>
        <div id="save-top" className={s.save}>
          <RaisedButton label="Save" disabled={saveDisabled} onClick={onSave} />
        </div>
      </div>
      <div className={s.endpoints}>
        <LocalityAutocomplete id="from-autocomplete-compact"
          initialInput={fromInputValue}
          terminal={from} endpoint="from"
          className={s.compact} compact={true} items={[]} />
        <LocalityAutocomplete id="from-autocomplete-full"
          initialInput={fromInputValue}
          terminal={from} endpoint="from"
          className={s.full} compact={false} items={[]} />
        <span className={s.arrow}>
          <FontIcon className="material-icons">arrow_forward</FontIcon>
        </span>
        <LocalityAutocomplete id="to-autocomplete-compact"
          initialInput={toInputValue}
          terminal={to} endpoint="to"
          className={s.compact} compact={true} items={[]} />
        <LocalityAutocomplete id="to-autocomplete-full"
          initialInput={toInputValue}
          terminal={to} endpoint="to"
          className={s.full} compact={false} items={[]} />
      </div>
      <div className={s.transportAndId}>
        <div className={s.transport}>
          <SelectField id="transport-select"
            value={transport}
            onChange={onChangeTransport.bind(this)}
            floatingLabelText="Transport"
            floatingLabelFixed={true}
            hintText="Select transport type">
            {transportOptions}
          </SelectField>
        </div>
        <div className={s.identifier}>
          <TextField id="identifier-input"
            style={ { width: '100%'} }
            value={identifier || ''}
            floatingLabelText="Identifier"
            hintText="Name, number etc."
            onChange={onChangeProperty('identifier')}
          />
        </div>
      </div>
      <div className={s.additionalInfo} style={additionalHidden}>
        <div className={s.additionalHeader}>
          Any additional information is greatly appreciated!
        </div>
        <div className={s.terminals}>
          <div className={s.departure}>
            <div className={s.terminalHeader}>
              Departure
            </div>
            <Terminal id="departure-terminal" {...{
              terminal: departureValue,
              endpoint: 'departure',
              date: departureDate,
              time: departureTime,
              place: departureValue,
              description: departureDescription || '',
              onChangeTime: onChangeProperty,
              onChangeDescription: onChangeProperty
            }} />
          </div>
          <div className={s.arrival}>
            <div className={s.terminalHeader}>
              Arrival
            </div>
            <Terminal id="arrival-terminal" {...{
              terminal: arrivalValue,
              endpoint: 'arrival',
              date: arrivalDate,
              time: arrivalTime,
              place: arrivalValue,
              description: arrivalDescription || '',
              onChangeTime: onChangeProperty,
              onChangeDescription: onChangeProperty
            }} />
          </div>
        </div>
        <div className={s.cost}>
          <div className={s.costHeader}>
            Cost
          </div>
          <div className={s.price}>
            <div className={s.amount}>
              <TextField id="price-amount-input"
                style={ { width: '100%'} }
                value={priceAmount || ''}
                floatingLabelText="Price"
                hintText="Price"
                onChange={onChangeProperty('priceAmount')}
              />
            </div>
            <div className={s.currency}>
              <SelectField id="currency-select"
                style={ { width: '100%'} }
                value={priceCurrency}
                floatingLabelText="Currency"
                floatingLabelFixed={true}
                hintText="Select currency"
                onChange={onChangeProperty('priceCurrency')}>
                {currencies}
              </SelectField>
            </div>
          </div>
        </div>
        <div className={s.description}>
          <TextField id="description-input"
            value={description}
            hintText="Description and comments about this link..."
            floatingLabelText="Description"
            hintStyle={ { bottom: '36px' } }
            floatingLabelStyle={ { color: '#000000' } }
            floatingLabelFocusStyle={ { fontSize: '21px', top: '32px' } }
            multiLine={true}
            fullWidth={true}
            rows={2}
            onChange={onChangeProperty('description')}
          />
        </div>
        {
          (!uuid && user) &&
          <div className={s.ratings}>
            <div className={s.rating}>
              <div className={s.ratingLabel}>
                <label>Availability</label>
              </div>
              <div className={s.ratingValue}>
                <Rating id="availability-rating"
                  {...ratingStyles} initialRate={availabilityRating}
                  onChange={onChangeRating('availability')} />
              </div>
            </div>
            <div className={s.rating}>
              <div className={s.ratingLabel}>
                <label>Departure reliability</label>
              </div>
              <div className={s.ratingValue}>
                <Rating id="dept-reliability-rating"
                  {...ratingStyles} initialRate={departureRating}
                  onChange={onChangeRating('departure')} />
              </div>
            </div>
            <div className={s.rating}>
              <div className={s.ratingLabel}>
                <label>Arrival reliability</label>
              </div>
              <div className={s.ratingValue}>
                <Rating id="arr-reliability-rating"
                  {...ratingStyles} initialRate={arrivalRating}
                  onChange={onChangeRating('arrival')} />
              </div>
            </div>
            <div className={s.rating}>
              <div className={s.ratingLabel}>
                <label>Awesomeness</label>
              </div>
              <div className={s.ratingValue}>
                <Rating id="awesomeness-rating"
                  {...ratingStyles} initialRate={awesomeRating}
                  onChange={onChangeRating('awesome')} />
              </div>
            </div>
          </div>
        }
      </div>
      <div className={s.save}>
        { uuid && <RaisedButton label="Delete" id="delete-button" onClick={onDelete} /> }
        <RaisedButton label="Save" disabled={saveDisabled} onClick={onSave} />
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    user: state.auth.auth.user,
    uuid: state.editCheckIn.uuid,
    mode: state.editCheckIn.mode,
    from: state.editCheckIn.from,
    to: state.editCheckIn.to,
    departure: state.editCheckIn.departure,
    arrival: state.editCheckIn.arrival,
    transport: state.editCheckIn.transport,
    identifier: state.editCheckIn.identifier,
    departureDate: state.editCheckIn.departureDate,
    departureTime: state.editCheckIn.departureTime,
    departureDescription: state.editCheckIn.departureDescription,
    arrivalDate: state.editCheckIn.arrivalDate,
    arrivalTime: state.editCheckIn.arrivalTime,
    arrivalDescription: state.editCheckIn.arrivalDescription,
    priceAmount: state.editCheckIn.priceAmount,
    priceCurrency: state.editCheckIn.priceCurrency,
    description: state.editCheckIn.description,
    availabilityRating: state.editCheckIn.availabilityRating,
    departureRating: state.editCheckIn.departureRating,
    arrivalRating: state.editCheckIn.arrivalRating,
    awesomeRating: state.editCheckIn.awesomeRating,
  }), {
    saveCheckIn,
    deleteCheckIn,
    setTransport,
    setProperty
  })(withStyles(s)(EditCheckIn))
);
