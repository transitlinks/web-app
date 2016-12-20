import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ViewLinkInstance.css';
import FontIcon from 'material-ui/FontIcon';
import { injectIntl, FormattedMessage } from 'react-intl';
import { formatDuration } from '../utils';

const formatDate = (dateStr) => {
  
  if (!dateStr) {
    return '';
  }
  
  return dateStr.substring(0, 10);

};

const formatTime = (hours, minutes) => {
  
  let time = '';
  
  if (hours) {
    time += (hours < 10) ? '0' + hours : hours;
  } else {
    time += '00';
  }
  
  if (minutes) {
    time += ':';
    time += (minutes < 10) ? '0' + minutes : minutes;
  } else {
    time += ':00';
  }

  return time;

};
 
const ViewLinkInstance = ({ intl, linkInstance }) => {
  
  const { 
    link, transport,
    departureDate, departureHour, departureMinute,
    arrivalDate, arrivalHour, arrivalMinute,
    durationMinutes,
    priceAmount, priceCurrency,
    description,
    avgRating
  } = linkInstance;
 
  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <span id="place-from">{link.from.description}</span>
          <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
          <span id="place-to">{link.to.description}</span>
        </div>
      </div>
      <div className={s.firstRow}>
        <div className={s.transportAndDuration}>
          <div className={s.transport}>
            {transport.slug.toUpperCase()}
          </div>
          <div className={s.duration}>
            {formatDuration(durationMinutes)}
          </div>
        </div>
        <div className={s.times}>
          <div className={s.time} id="departure">
            <span className={s.timeLabel}>DEP</span>
            <span className={s.timeDate} id="dept-date-value">
              {formatDate(departureDate)}
            </span>
            <span className={s.timeTime} id="dept-time-value">
              {formatTime(departureHour, departureMinute)}
            </span>
          </div>
          <div className={s.time} id="arrival">
            <span className={s.timeLabel}>ARR</span>
            <span className={s.timeDate} id="arr-date-value">
              {formatDate(arrivalDate)}
            </span>
            <span className={s.timeTime} id="arr-time-value">
              {formatTime(arrivalHour, arrivalMinute)}
            </span>
          </div>
        </div>
      </div>
      <div className={s.cost}>
        <span>COST: &nbsp;</span> 
        <span id="price-value">{priceAmount} {priceCurrency}</span>
      </div>
      <div>
        <span id="desc-value">{description}</span>
      </div>
      <div>
        <span id="avg-rating-value">{avgRating}</span>
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(ViewLinkInstance))
);
