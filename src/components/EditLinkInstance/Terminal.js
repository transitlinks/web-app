import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditLinkInstance.css';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';
import AddressAutocomplete from './AddressAutocomplete';

const Terminal = ({
  endpoint, terminal,
  date, time,
  place,
  description,
  onChangeTime,
  onChangeDescription, onChangeLocation, onChangeAddress
}) => {
  
  const labels = {
    departure: {
      dateInputTitle: 'Departure date',
      timeInputTitle: 'Departure time',
      placeInputTitle: 'Departure place'
    },
    arrival: {
      dateInputTitle: 'Arrival date',
      timeInputTitle: 'Arrival time',
      placeInputTitle: 'Arrival place'
    }
  };
  
  let location = '';
  if (place) {
    location = place.lat + ',' + place.lng;
  }

  return (
    <div className={s.terminal}>
      <div className={s.dateTime}>
        <div className={s.date}>
          <DatePicker id={`${endpoint}-date-picker`}
            hintText={labels[endpoint].dateInputTitle}
            value={date}
            onChange={onChangeTime(`${endpoint}Date`)}
          />
        </div>
        <div className={s.time}>
          <TimePicker id={`${endpoint}-time-picker`}
            format="24hr"
            hintText={labels[endpoint].timeInputTitle}
            value={time}
            onChange={onChangeTime(`${endpoint}Time`)}
          />
        </div>
      </div>
      <div className={s.address}>
        <AddressAutocomplete id={`${endpoint}-address-compact`}
          initialValue={terminal}
          endpoint={endpoint}
          location={location} 
          className={s.compact} compact={true} />
        <AddressAutocomplete id={`${endpoint}-address-full`} 
          initialValue={terminal}
          endpoint={endpoint}
          location={location} 
          className={s.full} compact={false} />
      </div>
      <div className={s.place}>
        <TextField id={`${endpoint}-terminal-place-input`}
          value={description}
          floatingLabelText={labels[endpoint].placeInputTitle}
          hintText="Place description"
          multiLine={true}
          rows={1}
          onChange={onChangeDescription(`${endpoint}Description`)} />
      </div>
    </div>
  );

};

export default withStyles(s)(Terminal);
