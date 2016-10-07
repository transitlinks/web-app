import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditLinkInstance.css';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';

const Terminal = ({
  terminal,
  date, time,
  onChangeTime
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

  return (
    <div className={s.terminal}>
      <div className={s.dateTime}>
        <div className={s.date}>
          <DatePicker id={`${terminal}-date-picker`}
            hintText={labels[terminal].dateInputTitle}
            value={date}
            onChange={onChangeTime(`${terminal}Date`)}
          />
        </div>
        <div className={s.time}>
          <TimePicker id={`${terminal}-time-picker`}
            format="24hr"
            hintText={labels[terminal].timeInputTitle}
            value={time}
            onChange={onChangeTime(`${terminal}Time`)}
          />
        </div>
      </div>
      <div className={s.place}>
        <TextField id={`${terminal}-terminal-place-input`}
          floatingLabelText={labels[terminal].placeInputTitle}
          hintText="Place description" />
      </div>
    </div>
  );

};

export default withStyles(s)(Terminal);
