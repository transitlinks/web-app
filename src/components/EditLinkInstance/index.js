import React from 'react';
import { connect } from 'react-redux';
import { 
  saveLinkInstance, 
  setTransport,
  setProperty 
} from '../../actions/editLink';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditLinkInstance.css';
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

const EditLinkInstance = ({
  intl,
  saveLinkInstance, setTransport, setProperty,
  linkInstance, transportTypes,  
  from, to, transport,
  departureDate, departureTime, departurePlace,
  arrivalDate, arrivalTime, arrivalPlace,
  priceAmount, priceCurrency,
  description,
  availabilityRating, departureRating, arrivalRating, awesomeRating
}) => {

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

    saveLinkInstance({ linkInstance: mergeNonNull({ 
      from, to, transport,
    }, {
      departureDate: departureDateJson, 
      departureHour, departureMinute, departurePlace,
      arrivalDate: arrivalDateJson, 
      arrivalHour, arrivalMinute, arrivalPlace,
      priceAmount: parseFloat(priceAmount), priceCurrency,
      description,
      availabilityRating, departureRating, arrivalRating, awesomeRating
    })});
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
    <MenuItem key={type.slug} style={{ "WebkitAppearance": "initial" }} 
      value={type.slug} primaryText={intl.formatMessage(msg[type.slug])} />
  ));
  
  const currencies = cc.codes().map(code => (
    <MenuItem key={code} style={{ "WebkitAppearance": "initial" }} value={code} primaryText={`${code} ${cc.code(code).currency}`} />
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

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <FormattedMessage {...msg.addLink} />
        </div>
        <div className={s.save}>
          <RaisedButton label="Save" onClick={onSave} />
        </div>
      </div>
      <div className={s.endpoints}>
        <LocalityAutocomplete endpoint="from" items={[]} />
        <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
        <LocalityAutocomplete endpoint="to" items={[]} />
      </div>
      <div>
        <div>
          <SelectField id="transport-select"
            value={transport} 
            onChange={onChangeTransport.bind(this)}
            floatingLabelText="Transport"
            floatingLabelFixed={true}
            hintText="Select transport type">
            {transportOptions}
          </SelectField>
        </div>
        <div className={s.terminals}>
          <div className={s.departure}>
            <div className={s.terminalHeader}>
              Departure
            </div>
            <Terminal { ...{
              terminal: 'departure', 
              date: departureDate, 
              time: departureTime, 
              place: departurePlace, 
              onChangeTime: onChangeProperty,
              onChangePlace: onChangeProperty
            } } />
          </div>
          <div className={s.arrival}>
            <div className={s.terminalHeader}>
              Arrival
            </div>
            <Terminal { ...{
              terminal: 'arrival', 
              date: arrivalDate, 
              time: arrivalTime,
              place: arrivalPlace, 
              onChangeTime: onChangeProperty,
              onChangePlace: onChangeProperty
            } } />
          </div>
        </div>
        <div className={s.cost}>
          <div className={s.costHeader}>
            Cost
          </div>
          <div className={s.price}>
            <div className={s.amount}>
              <TextField id="price-amount-input"
                value={priceAmount}
                floatingLabelText="Price"
                hintText="Trip price"
                onChange={onChangeProperty('priceAmount')} 
              />
            </div>
            <div className={s.currency}>
              <SelectField id="currency-select"
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
            hintText="Description and comments about this link..."
            floatingLabelText="Description"
            floatingLabelStyle={ { color: '#000000' } }
            floatingLabelFocusStyle={ { fontSize: '21px' } }
            multiLine={true}
            fullWidth={true}
            rows={3}
            onChange={onChangeProperty('description')}
          />
        </div>
        <div className={s.ratings}>
          <div className={"table-row " + s.rating}>
            <div className={"col-1-2 " + s.ratingLabel}>
              <label>Availability</label>
            </div>
            <div className="col-1-2">
              <Rating {...ratingStyles} initialRate={availabilityRating} 
                onChange={onChangeRating('availability')} />
            </div>
          </div>
          <div className={"table-row " + s.rating}>
            <div className={"col-1-2 " + s.ratingLabel}>
              <label>Departure reliability</label>
            </div>
            <div className="col-1-2">
              <Rating {...ratingStyles} initialRate={departureRating} 
                onChange={onChangeRating('departure')} />
            </div>
          </div>
          <div className={"table-row " + s.rating}>
            <div className={"col-1-2 " + s.ratingLabel}>
              <label>Arrival reliability</label>
            </div>
            <div className="col-1-2">
              <Rating {...ratingStyles} initialRate={arrivalRating} 
                onChange={onChangeRating('arrival')} />
            </div>
          </div>
          <div className={"table-row " + s.rating}>
            <div className={"col-1-2 " + s.ratingLabel}>
              <label>Awesomeness</label>
            </div>
            <div className="col-1-2">
              <Rating {...ratingStyles} initialRate={awesomeRating}
                onChange={onChangeRating('awesome')} />
            </div>
          </div>
        </div>
      </div>
      <div className={s.save}>
        <RaisedButton label="Save" onClick={onSave} />
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    from: state.editLink.from,
    to: state.editLink.to,
    transport: state.editLink.transport,
    departureDate: state.editLink.departureDate,
    departureTime: state.editLink.departureTime,
    departurePlace: state.editLink.departurePlace,
    arrivalDate: state.editLink.arrivalDate,
    arrivalTime: state.editLink.arrivalTime,
    arrivalPlace: state.editLink.arrivalPlace,
    priceAmount: state.editLink.priceAmount,
    priceCurrency: state.editLink.priceCurrency,
    description: state.editLink.description,
    availabilityRating: state.editLink.availabilityRating, 
    departureRating: state.editLink.departureRating, 
    arrivalRating: state.editLink.arrivalRating, 
    awesomeRating: state.editLink.awesomeRating,
    linkInstance: state.editLink.linkInstance
  }), {
    saveLinkInstance,
    setTransport,
    setProperty
  })(withStyles(s)(EditLinkInstance))
);
