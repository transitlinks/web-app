import React from 'react';
import { connect } from 'react-redux';
import { saveRating, voteUp } from '../../actions/viewLinkInstance';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './ViewLinkInstance.css';
import FontIcon from 'material-ui/FontIcon';
import Rating from 'react-rating';
import { injectIntl, FormattedMessage } from 'react-intl';
import { formatDuration, truncate } from '../utils';

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
 
const ViewLinkInstance = ({
  user,
  saveRating, voteUp,
  intl, linkInstance, initialRatings, ratings
}) => {
  
  const { 
    uuid,
    link, transport,
    departureDate, departureHour, departureMinute,
    arrivalDate, arrivalHour, arrivalMinute,
    durationMinutes,
    priceAmount, priceCurrency,
    description
  } = linkInstance;

  const {
    avgRating,
    avgAvailabilityRating, avgDepartureRating, avgArrivalRating, avgAwesomeRating,
    userAvailabilityRating, userDepartureRating, userArrivalRating, userAwesomeRating
  } = (ratings || initialRatings || {});

  const onChangeRating = (property) => {
    return (rating) => {
      console.log('set rating', property, rating);
      saveRating({
        linkInstanceUuid: uuid,
        property,
        rating
      });
      //setProperty(`${name}Rating`, rating);
    }
  };

  const fromCommaIndex = link.from.description.indexOf(',');
  const fromCity = link.from.description.substring(0, fromCommaIndex);
  const fromArea = link.from.description.substring(fromCommaIndex + 1);
  
  const toCommaIndex = link.to.description.indexOf(',');
  const toCity = link.to.description.substring(0, toCommaIndex);
  const toArea = link.to.description.substring(toCommaIndex + 1);

  const ratingProps = {
    empty: <FontIcon className={cx(s.star, "material-icons")}>star_border</FontIcon>,
    full: <FontIcon className={cx(s.star, "material-icons")}>star</FontIcon>
  };
  
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
          { 
            (departureDate || departureHour) && 
            <div className={s.time} id="departure">
              <span className={s.timeLabel}>DEP</span>
              <span className={s.timeDate} id="dept-date-value">
                {formatDate(departureDate)}
              </span>
              <span className={s.timeTime} id="dept-time-value">
                {formatTime(departureHour, departureMinute)}
              </span>
            </div>
          }
          { 
            (arrivalDate || arrivalHour) && 
            <div className={s.time} id="arrival">
              <span className={s.timeLabel}>ARR</span>
              <span className={s.timeDate} id="arr-date-value">
                {formatDate(arrivalDate)}
              </span>
              <span className={s.timeTime} id="arr-time-value">
                {formatTime(arrivalHour, arrivalMinute)}
              </span>
            </div>
          }
        </div>
      </div>
      {
        priceAmount &&
        <div className={s.cost}>
          <span>COST: &nbsp;</span> 
          <span id="price-value">{priceAmount} {priceCurrency}</span>
        </div>
      }
      <div>
        <span id="desc-value">{description}</span>
      </div>
      <div className={s.ratingsAndVotes}>
        <div className={s.ratings}>
          <div className={s.rating}>
            { 
              user &&
              <div className={s.ratingValue}>
                <Rating id="availability-rating"
                  {...ratingProps} initialRate={userAvailabilityRating} 
                  onChange={onChangeRating('availability')} />
              </div>
            }
            <div className={s.ratingLabel}>
              <label>Availability</label>
            </div>
            <div className={s.avgRatingValue}>
              {truncate(avgAvailabilityRating, 4)}
            </div>
          </div>
          <div className={s.rating}>
            { 
              user &&
              <div className={s.ratingValue}>
                <Rating id="dept-reliability-rating" 
                  {...ratingProps} initialRate={userDepartureRating} 
                  onChange={onChangeRating('departure')} />
              </div>
            }
            <div className={s.ratingLabel}>
              <label>Departure reliability</label>
            </div>
            <div className={s.avgRatingValue}>
              {truncate(avgDepartureRating, 4)}
            </div>
          </div>
          <div className={s.rating}>
            { 
              user &&
              <div className={s.ratingValue}>
                <Rating id="arr-reliability-rating"
                  {...ratingProps} initialRate={userArrivalRating} 
                  onChange={onChangeRating('arrival')} />
              </div>
            }
            <div className={s.ratingLabel}>
              <label>Arrival reliability</label>
            </div>
            <div className={s.avgRatingValue}>
              {truncate(avgArrivalRating, 4)}
            </div>
          </div>
          <div className={s.rating}>
            { 
              user &&
              <div className={s.ratingValue}>
                <Rating id="awesomeness-rating"
                  {...ratingProps} initialRate={userAwesomeRating}
                  onChange={onChangeRating('awesome')} />
              </div>
            }
            <div className={s.ratingLabel}>
              <label>Awesomeness</label>
            </div>
            <div className={s.avgRatingValue}>
              {truncate(avgAwesomeRating, 4)}
            </div>
          </div>
        </div>
        <div id="total-average" className={s.totalAverage}>
          <div className={s.totalAverageLabel}>
            SCORE
          </div>
          <div id="total-average-value" className={s.totalAverageValue}>
            {truncate(avgRating, 4)}
          </div>
        </div>
        <div className={s.vote}>
          <div className={s.voteLabel}>
            Hot or Not?
          </div>
          <div id="up-vote" className={s.voteButtons}>
            <FontIcon className={cx(s.voteButton, "material-icons")} style={{ fontSize: '32px' }}>sentiment_very_satisfied</FontIcon>
            <FontIcon className={cx(s.voteButton, "material-icons")} style={{ fontSize: '32px' }}>sentiment_very_dissatisfied</FontIcon>
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    user: state.auth.auth.user,
    ratings: state.viewLinkInstance.ratings
  }), {
    saveRating,
    voteUp
  })(withStyles(s)(ViewLinkInstance))
);
