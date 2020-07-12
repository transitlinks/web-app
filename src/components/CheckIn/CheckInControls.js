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

const constructDateTime = ({ date, time }) => {
  date.setHours(time.getHours());
  date.setMinutes(time.getMinutes());
  return date.toISOString();
};

const CheckInControls = ({
  checkIn, savedCheckIn, editCheckIn, deleteCheckIn, saveCheckIn, setProperty
}) => {

  const dateTime = ({ date, time }) => {
    return {
      date: date || new Date((savedCheckIn || checkIn).date),
      time: time || new Date((savedCheckIn || checkIn).date)
    };
  };

  console.log('checkin controls', checkIn);
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
                          saveCheckIn({ checkIn: { uuid: checkIn.uuid, date: constructDateTime(dateTime({ date: value })) } });
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
                          saveCheckIn({ checkIn: { uuid: checkIn.uuid, date: constructDateTime(dateTime({ time: value })) } });
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
