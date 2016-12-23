import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Ratings.css';
import cc from 'currency-codes';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import Rating from 'react-rating';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const Ratings = ({
  intl,
  availabilityRating,
  departureRating,
  arrivalRating,
  awesomeRating,
  onChangeRating
}) => {

  const ratingCss = { 
    'display': 'inline-block',
    'borderRadius': '50%',
    'border': '5px double white',
    'width': '20px',
    'height': '20px',
  };
  
  const ratingEmptyCss = Object.assign({
    'backgroundColor': '#f0f0f0'
  }, ratingCss);
  const ratingFullCss = Object.assign({
    'backgroundColor': 'black'
  }, ratingCss);
  

  const ratingStyles = {
    empty: ratingEmptyCss,
    full: ratingFullCss
  };
  
  return (
    <div className={s.ratings}>
      <div className={s.rating}>
        <div className={s.ratingLabel}>
          <label>Availability</label>
        </div>
        <div className={s.ratingValue}>
          <Rating id="availability-rating"
            {...ratingStyles} initialRate={availabilityRating} 
            onChange={onChangeRating('availability')} />
        </div>
      </div>
      <div className={s.rating}>
        <div className={s.ratingLabel}>
          <label>Departure reliability</label>
        </div>
        <div className={s.ratingValue}>
          <Rating id="dept-reliability-rating" 
            {...ratingStyles} initialRate={departureRating} 
            onChange={onChangeRating('departure')} />
        </div>
      </div>
      <div className={s.rating}>
        <div className={s.ratingLabel}>
          <label>Arrival reliability</label>
        </div>
        <div className={s.ratingValue}>
          <Rating id="arr-reliability-rating"
            {...ratingStyles} initialRate={arrivalRating} 
            onChange={onChangeRating('arrival')} />
        </div>
      </div>
      <div className={s.rating}>
        <div className={s.ratingLabel}>
          <label>Awesomeness</label>
        </div>
        <div className={s.ratingValue}>
          <Rating id="awesomeness-rating"
            {...ratingStyles} initialRate={awesomeRating}
            onChange={onChangeRating('awesome')} />
        </div>
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(Ratings))
);
