import React from 'react';
import { connect } from 'react-redux';
import { 
  saveLinkInstance, 
  setTransport,
  setProperty 
} from '../../actions/editLink';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditLinkInstance.css';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import MenuItem from 'material-ui/MenuItem';
import LocalityAutocomplete from './LocalityAutocomplete';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const EditLinkInstance = ({
  intl,
  saveLinkInstance, setTransport, setProperty,
  linkInstance, transportTypes,  
  from, to, transport,
  departureDate, departureTime, arrivalDate, arrivalTime 
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
      departureDate: departureDateJson, departureHour, departureMinute,
      arrivalDate: arrivalDateJson, arrivalHour, arrivalMinute  
    })});
  };

  const onChangeTime = (property) => {
    return (event, value) => {
      setProperty(property, value);
    };
  };
  
  const onChangeTransport = (event, index, value) => {
    setTransport(value);
  };

  const transportOptions = transportTypes.map(type => (
    <MenuItem key={type.slug} style={{ "WebkitAppearance": "initial" }} 
      value={type.slug} primaryText={intl.formatMessage(msg[type.slug])} />
  ));
  
  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <FormattedMessage {...msg.addLink} />
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
        <div className={s.times}>
          <div className={s.dateTime}>
            <div className={s.date}>
              <DatePicker id="departure-date-picker"
                hintText="Departure date"
                value={departureDate}
                onChange={onChangeTime('departureDate')}
              />
            </div>
            <div className={s.time}>
              <TimePicker className="time-picker" id="departure-time-picker"
                dialogBodyStyle={{ }}
                format="24hr"
                hintText="Departure time"
                value={departureTime}
                onChange={onChangeTime('departureTime')}
              />
            </div>
          </div>
          <div className={s.dateTime}>
            <div className={s.date}>
              <DatePicker id="arrival-date-picker"
                hintText="Arrival date"
                value={arrivalDate}
                onChange={onChangeTime('arrivalDate')}
              />
            </div>
            <div className={s.time}>
              <TimePicker id="arrival-time-picker"
                format="24hr"
                hintText="Arrival time"
                value={arrivalTime}
                onChange={onChangeTime('arrivalTime')}
              />
            </div>
          </div>
        </div>
        <div className={s.terminals}>
        </div>
        <div className={s.price}>
        </div>
        <div className={s.description}>
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
    arrivalDate: state.editLink.arrivalDate,
    arrivalTime: state.editLink.arrivalTime,
    linkInstance: state.editLink.linkInstance
  }), {
    saveLinkInstance,
    setTransport,
    setProperty
  })(withStyles(s)(EditLinkInstance))
);
