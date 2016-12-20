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

  const fromCommaIndex = link.from.description.indexOf(',');
  const fromCity = link.from.description.substring(0, fromCommaIndex);
  const fromArea = link.from.description.substring(fromCommaIndex + 1);
  
  const toCommaIndex = link.to.description.indexOf(',');
  const toCity = link.to.description.substring(0, toCommaIndex);
  const toArea = link.to.description.substring(toCommaIndex + 1);

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <div id="place-from">
            <div>
              {fromCity}
            </div>
            <div className={s.area}>
              {fromArea}
            </div>
          </div>
          <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
          <div id="place-to">
            <div>
              {toCity}
            </div>
            <div className={s.area}>
              {toArea}
            </div>
          </div>
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
