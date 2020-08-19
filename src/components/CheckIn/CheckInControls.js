import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React from 'react';
import { deleteCheckIn, saveCheckIn } from '../../actions/posts';
import { setProperty } from '../../actions/properties';
import s from './CheckIn.css';
import FontIcon from 'material-ui/FontIcon';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import { getPaddedDate, getPaddedTime } from '../../core/utils';

const CheckInControls = ({
  checkIn, savedCheckIn, editCheckIn, deleteCheckIn, saveCheckIn, setProperty
}) => {

  const dateTime = ({ date, time }) => {
    const currentCheckIn = savedCheckIn || checkIn;
    const newDate = date ? getPaddedDate(date) : getPaddedDate(new Date(currentCheckIn.date));
    const newTime = time ? getPaddedTime(time) : getPaddedTime(new Date(currentCheckIn.date));
    return newDate + ' ' + newTime;
  };

  return (
    <div className={s.checkInControls}>
      <div className={s.checkInControlsLeft}>
        <FontIcon className="material-icons" style={{ fontSize: '20px ' }} onClick={() => {
          deleteCheckIn(checkIn.uuid);
        }}>delete</FontIcon>
      </div>
      <div className={s.checkInControlsRight}>
        <div className={s.checkInDateTime}>
          <div className={s.date}>
            <FontIcon className="material-icons" style={{ fontSize: '20px ' }}>today</FontIcon>
            <DatePicker id="checkin-date-picker"
                        value={savedCheckIn ? new Date(savedCheckIn.date) : new Date(checkIn.date)}
                        autoOk
                        fullWidth
                        floatingLabelFixed
                        floatingLabelStyle={{ width: '120px' }}
                        hintText="Date"
                        onChange={(event, value) => {
                          console.log('date value', value.getDate(), value.getMonth(), value.getFullYear());
                          saveCheckIn({ checkIn: { uuid: checkIn.uuid, date: dateTime({ date: value }) } });
                        }} />
          </div>
          <div className={s.time}>
            <FontIcon className="material-icons" style={{ fontSize: '20px ' }}>access_time</FontIcon>
            <TimePicker id="checkin-time-picker"
                        value={savedCheckIn ? new Date(savedCheckIn.date) : new Date(checkIn.date)}
                        format="24hr"
                        autoOk
                        fullWidth
                        floatingLabelFixed
                        hintText="Time"
                        onChange={(event, value) => {
                          console.log('time value', value.getHours(), value.getMinutes());
                          saveCheckIn({ checkIn: { uuid: checkIn.uuid, date: dateTime({ time: value }) } });
                        }} />
          </div>
        </div>
      </div>
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    editCheckIn: state.posts.editCheckIn || {},
    savedCheckIn: state.posts.checkIn
  }), {
    deleteCheckIn,
    saveCheckIn,
    setProperty
  })(withStyles(s)(CheckInControls))
);
