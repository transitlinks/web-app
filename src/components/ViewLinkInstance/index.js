import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ViewLinkInstance.css';
import FontIcon from 'material-ui/FontIcon';

const formatDate = (dateStr) => {
  
  if (!dateStr) {
    return '';
  }

  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

};

const formatTime = (hours, minutes) => {
  
  let time = '';
  
  if (hours) {
    time += (hours < 10) ? '0' + hours : hours;
  }
  
  if (minutes) {
    time += ':';
    time += (minutes < 10) ? '0' + minutes : minutes;
  }

  return time;

};
 
const ViewLinkInstance = ({ linkInstance }) => {
  
  const { 
    link, transport,
    departureDate, departureHour, departureMinute,
    arrivalDate, arrivalHour, arrivalMinute,
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
      <div>
        {transport.slug}
      </div>
      <div id="departure">
        <span>DEPARTURE: &nbsp;</span> 
        <span id="dept-date-value">{formatDate(departureDate)}</span> /
        <span id="dept-time-value">{formatTime(departureHour, departureMinute)}</span>
      </div>
      <div>
        <span>ARRIVAL:c&nbps;</span> 
        <span id="arr-date-value">{formatDate(arrivalDate)}</span> /
        <span id="arr-time-value">{formatTime(arrivalHour, arrivalMinute)}</span>
      </div>
      <div>
        <span>PRICE:c&nbsp;</span> 
        <span id="price-value">{priceAmount} {priceCurrency}</span>
      </div>
      <div>
        <span>DESC: &nbsp;</span> 
        <span id="desc-value">{description}</span>
      </div>
      <div>
        <span>SCORE: &nbsp;</span> 
        <span id="avg-rating-value">{avgRating}</span>
      </div>
    </div>
  );
}

export default withStyles(s)(ViewLinkInstance);
