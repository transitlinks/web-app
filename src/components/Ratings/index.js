import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Ratings.css';
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
    'width': '16px',
    'height': '16px',
  };
  
  const ratingEmptyCss = Object.assign({
    'backgroundColor': '#f0f0f0'
  }, ratingCss);
  const ratingFullCss = Object.assign({
    'backgroundColor': 'black'
  }, ratingCss);
  
  const ratingProps = {
    empty: <FontIcon className={cx(s.star, "material-icons")}>star_border</FontIcon>,
    full: <FontIcon className={cx(s.star, "material-icons")}>star</FontIcon>
  };

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
            {...ratingProps} initialRate={availabilityRating} 
            onChange={onChangeRating('availability')} />
        </div>
      </div>
      <div className={s.rating}>
        <div className={s.ratingLabel}>
          <label>Departure reliability</label>
        </div>
        <div className={s.ratingValue}>
          <Rating id="dept-reliability-rating" 
            {...ratingProps} initialRate={departureRating} 
            onChange={onChangeRating('departure')} />
        </div>
      </div>
      <div className={s.rating}>
        <div className={s.ratingLabel}>
          <label>Arrival reliability</label>
        </div>
        <div className={s.ratingValue}>
          <Rating id="arr-reliability-rating"
            {...ratingProps} initialRate={arrivalRating} 
            onChange={onChangeRating('arrival')} />
        </div>
      </div>
      <div className={s.rating}>
        <div className={s.ratingLabel}>
          <label>Awesomeness</label>
        </div>
        <div className={s.ratingValue}>
          <Rating id="awesomeness-rating"
            {...ratingProps} initialRate={awesomeRating}
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
