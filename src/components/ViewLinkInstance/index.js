import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ViewLinkInstance.css';
import FontIcon from 'material-ui/FontIcon';

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
      <div>
        DEPARTURE: {departureDate}/{departureHour}/{departureMinute}
      </div>
      <div>
        ARRIVAL: {arrivalDate}/{arrivalHour}/{arrivalMinute}
      </div>
      <div>
        PRICE: {priceAmount}/{priceCurrency}
      </div>
      <div>
        DESC: {description}
      </div>
      <div>
        SCORE: {avgRating}
      </div>
    </div>
  );
}

export default withStyles(s)(ViewLinkInstance);
