import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React from 'react';
import { deleteCheckIn, saveCheckIn } from '../../actions/checkIns';
import { setProperty } from '../../actions/properties';
import { saveTrip } from '../../actions/trips';
import s from './CheckIn.css';
import FontIcon from 'material-ui/FontIcon';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import { getPaddedDate, getPaddedTime } from '../../core/utils';
import { getMonthName, getLocalDateTimeValue } from '../utils';
import msgTransport from '../common/messages/transport';

const CheckInControls = ({
  intl, checkIn, savedCheckIn,
  deleteCheckIn, saveCheckIn, saveTrip
}) => {

  const dateTime = ({ date, time }) => {
    const currentCheckIn = savedCheckIn || checkIn;
    const newDate = date ? getPaddedDate(date) : getPaddedDate(new Date(currentCheckIn.date));
    const newTime = time ? getPaddedTime(time) : getPaddedTime(new Date(currentCheckIn.date));
    return newDate + ' ' + newTime;
  };

  const getFormattedDateTime = (localDateTime) => {
    const dateTime = new Date(localDateTime);
    const time = localDateTime.substring(11, 16);
    return getMonthName(dateTime) + ' ' + dateTime.getDate() + ' ' + time;
  };

  return (
    <div>
      {
        checkIn.departure &&
        <div className={s.checkInDeparture}>
          <div className={s.departureSummary}>
            { intl.formatMessage(msgTransport[checkIn.departure.transport]) } from { checkIn.departure.locality } { getFormattedDateTime(checkIn.departure.localDateTime) }
          </div>
          <div className={s.clearDeparture}>
            <FontIcon className="material-icons" style={{ fontSize: '16px' }} onClick={() => {
              saveCheckIn({ checkIn: { uuid: checkIn.uuid, departureUuid: null } });
            }}>cancel</FontIcon>
          </div>
        </div>
      }
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
                          value={savedCheckIn ? getLocalDateTimeValue(savedCheckIn.date) : getLocalDateTimeValue(checkIn.date)}
                          autoOk
                          fullWidth
                          floatingLabelFixed
                          floatingLabelStyle={{ width: '120px' }}
                          hintText="Date"
                          onChange={(event, value) => {
                            saveCheckIn({ checkIn: { uuid: checkIn.uuid, date: dateTime({ date: value }) } });
                          }} />
            </div>
            <div className={s.time}>
              <FontIcon className="material-icons" style={{ fontSize: '20px ' }}>access_time</FontIcon>
              <TimePicker id="checkin-time-picker"
                          value={savedCheckIn ? getLocalDateTimeValue(savedCheckIn.date) : getLocalDateTimeValue(checkIn.date)}
                          format="24hr"
                          autoOk
                          fullWidth
                          floatingLabelFixed
                          hintText="Time"
                          onChange={(event, value) => {
                            saveCheckIn({ checkIn: { uuid: checkIn.uuid, date: dateTime({ time: value }) } });
                          }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    editCheckIn: state.posts.editCheckIn || {},
    savedCheckIn: state.posts.checkIn,
    savedTrip: state.trips.savedTrip
  }), {
    deleteCheckIn,
    saveCheckIn,
    setProperty,
    saveTrip
  })(withStyles(s)(CheckInControls))
);
