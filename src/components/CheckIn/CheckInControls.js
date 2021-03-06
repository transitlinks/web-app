import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React from 'react';
import { deleteCheckIn, saveCheckIn } from '../../actions/checkIns';
import { setProperty } from '../../actions/properties';
import { saveTrip, deleteTrip } from '../../actions/trips';
import s from './CheckIn.css';
import DeleteContentDialog from '../common/DeleteContentDialog';
import FontIcon from 'material-ui/FontIcon';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import { getPaddedDate, getPaddedTime } from '../../core/utils';
import { getMonthName, getLocalDateTimeValue } from '../utils';
import msgTransport from '../common/messages/transport';
import TextField from 'material-ui/TextField';

const CheckInControls = ({
  intl, checkIn, savedCheckIn, editTrip, editTripName, deleteCandidate,
  setProperty, deleteCheckIn, saveCheckIn, saveTrip, deleteTrip
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

  let deleteDialog = null;
  if (deleteCandidate && (deleteCandidate.type === 'checkIn' || deleteCandidate.type === 'trip')) {
    deleteDialog = <DeleteContentDialog />;
  }

  return (
    <div>
      <div className={s.checkInControls}>
        <div className={s.checkInControlsLeft}>
          <FontIcon className="material-icons" style={{ fontSize: '20px' }} onClick={() => {
            setProperty('posts.deleteCandidate', {
              type: 'checkIn',
              dialogText: <div><span>Delete check-in</span>&nbsp;<span className={s.highlight}>including all content</span>?</div>,
              deleteItem: deleteCheckIn,
              uuid: checkIn.uuid
            });
          }}>delete</FontIcon>
        </div>
        <div className={s.tripInfoAndLocality}>
          <div className={s.tripInfo}>
            {
              (!checkIn.trip || editTrip) ? (
                <div className={s.tripInputContainer}>
                  <div className={s.nameInput}>
                    <TextField id="transport-id"
                               value={editTripName || ''}
                               fullWidth
                               hintText={!editTripName ? 'Trip name' : null}
                               onChange={(e) => setProperty('trips.editTripName', e.target.value)}
                    />
                  </div>
                  <div className={s.submit} onClick={() => {
                    setProperty('trips.editTrip', null);
                  }}>
                    <div className={s.submitText}>
                      <FontIcon className="material-icons" style={{ fontSize: '24px ' }} onClick={() => {
                        saveTrip({ name: editTripName, firstCheckInUuid: checkIn.uuid });
                      }}>play_circle_outlined</FontIcon>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={s.existingTrip}>
                  <div className={s.tripName}>
                    { checkIn.trip.name }
                  </div>
                  {
                    !checkIn.trip.lastCheckIn &&
                    <div className={s.endTripButton}>
                      <FontIcon className="material-icons" style={{ fontSize: '16px ', marginLeft: '1px', display: 'block' }} onClick={() => {
                        saveTrip({ uuid: checkIn.trip.uuid, lastCheckInUuid: checkIn.uuid });
                      }}>stop</FontIcon>
                    </div>
                  }
                  {
                    checkIn.trip.lastCheckIn &&
                    <div className={s.deleteTripButton}>
                      <FontIcon className="material-icons" style={{ fontSize: '20px', marginTop: '-1px' }} onClick={() => {
                        setProperty('posts.deleteCandidate', {
                          type: 'trip',
                          dialogText: <span><span>Delete trip</span>&nbsp;<span className={s.highlight}>{checkIn.trip.name}</span></span>,
                          deleteItem: deleteTrip,
                          uuid: checkIn.trip.uuid
                        });
                      }}>delete</FontIcon>
                    </div>
                  }
                </div>
              )
            }
          </div>
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
      { deleteDialog }
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    editCheckIn: state.posts.editCheckIn || {},
    savedCheckIn: state.posts.checkIn,
    savedTrip: state.trips.savedTrip,
    editTrip: state.trips.editTrip,
    editTripName: state.trips.editTripName,
    deleteCandidate: state.posts.deleteCandidate
  }), {
    deleteCheckIn,
    saveCheckIn,
    setProperty,
    saveTrip,
    deleteTrip
  })(withStyles(s)(CheckInControls))
);
