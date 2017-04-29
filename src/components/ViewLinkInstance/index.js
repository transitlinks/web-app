import React from 'react';
import { connect } from 'react-redux';
import { saveRating, vote } from '../../actions/viewLinkInstance';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './ViewLinkInstance.css';
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Chip from 'material-ui/Chip';
import { orange600, green600 } from 'material-ui/styles/colors';
import Rating from 'react-rating';
import LinkInstanceMedia from './LinkInstanceMedia';
import { Marker, Polyline, GoogleMap, withGoogleMap } from 'react-google-maps';
import { injectIntl, FormattedMessage } from 'react-intl';
import { formatDuration, truncate } from '../utils';
import Link from '../Link';

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
 
const InstanceMap = withGoogleMap(props => (
	<GoogleMap
    options={{
      disableDoubleClickZoom: true,
      draggable: false,
      scrollwheel: false,
      disableDefaultUI: true,
      zoopControl: false,
      streetViewControl: false,
      scaleControl: false
    }}
		ref={props.onMapLoad}
		defaultZoom={12}
    defaultCenter={{...props.latLng}}>
		{props.polyLine}
	</GoogleMap>
));

const ViewLinkInstance = ({
  user,
  setProperty, saveRating, vote,
  intl, 
  linkInstance, initialRatings, ratings,
  upVotes, downVotes
}) => {
  
  const { 
    uuid,
    link, transport,
    mode, identifier,
    departureDate, departureHour, departureMinute,
    arrivalDate, arrivalHour, arrivalMinute,
    departureDescription, departureAddress, departureLat, departureLng,
    arrivalDescription, arrivalAddress, arrivalLat, arrivalLng,
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
      saveRating({
        linkInstanceUuid: uuid,
        property,
        rating
      });
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

  const mapLoaded = (map) => {
    
    if (!map) return;

    const fromLatLng = new google.maps.LatLng(link.from.lat, link.from.lng);
    const toLatLng = new google.maps.LatLng(link.to.lat, link.to.lng);
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(fromLatLng);
    bounds.extend(toLatLng);
    map.fitBounds(bounds);
  
  };

	const renderMap = () => {
			
		return  (
      <InstanceMap
    		containerElement={
      		<div style={{ height: `100%` }} />
    		}
    		mapElement={
      		<div style={{ height: `100%` }} />
    		}
				latLng={{ lat: link.from.lat, lng: link.from.lng }}
        polyLine={
          <Polyline path={[
            { lat: link.from.lat, lng: link.from.lng },
            { lat: link.to.lat, lng: link.to.lng }
          ]}/>
        }
    		onMapLoad={mapLoaded}
  		/>
		);
  
  };

  const modeBackgrounds = {
    'research': orange600,
    'experience': green600
  };
  
  const editLink = (
    <div className={s.edit}>
      {
        linkInstance.privateUuid &&
        <Link to={`/link-instance/${linkInstance.privateUuid}/edit`}>Edit</Link>
      }
    </div>
  );
  
  return (
    <div className={s.container}>
      <div className={s.topScore}>
        <div className={s.modeAndEdit}>
          <div className={s.mode} id="mode-value">
            <Chip backgroundColor={modeBackgrounds[mode]}>
              {mode}
            </Chip>
          </div>
          <div id="top-score" className={cx(s.score, !avgRating ? s.hidden : '')}>
            <div className={s.scoreLabel}>
              <i className="material-icons">stars</i>
            </div>
            <div id="top-score-value" className={s.scoreValue}>
              {truncate(avgRating, 4)}
            </div>
          </div>
          {editLink}
        </div>
        <div className={s.vote}>
          <div className={s.voteLabel}>
          </div>
          <div id="top-up-vote" className={s.voteButtons}>
            <i id="top-upvotes-button" 
              className={cx(s.voteButton, s.voteUp, s.pulsar1, "material-icons")}
              onClick={() => vote(uuid, 'upVotes')}
            >
              sentiment_very_satisfied
            </i>
            <span id="top-upvotes-value" className={cx(s.voteValue, s.voteUp)}>
              { upVotes || linkInstance.upVotes }
            </span>
            <i id="top-downvotes-button"
              className={cx(s.voteButton, s.voteDown, s.pulsar2, "material-icons")}
              onClick={() => vote(uuid, 'downVotes')}
            >
              sentiment_very_dissatisfied
            </i>
            <span id="top-downvotes-value" className={cx(s.voteValue, s.voteDown)}>
              { downVotes || linkInstance.downVotes }
            </span>
          </div>
        </div>
      </div>
      {
        linkInstance.privateUuid &&
        <div className={s.narrow}>
          {editLink}
        </div>
      }
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
            <div className={s.transportType}>
              {transport.slug.toUpperCase()}
            </div>
            <div className={s.identifier} id="identifier-value">
              {identifier}
            </div>
          </div>
          {
            (durationMinutes || priceAmount) &&
            <div className={s.costAndDuration}>
              { 
                durationMinutes &&
                <div className={s.duration}>
                  <i className="material-icons">schedule</i> 
                  {formatDuration(durationMinutes)}
                </div>
              }
              {
                priceAmount &&
                <div className={s.cost}>
                  <i className="material-icons">attach_money</i>
                  <span id="price-value">{priceAmount}&nbsp;{priceCurrency}</span>
                </div>
              }
            
            </div>
          }
        </div>
        <div className={s.times}>
        </div>
      </div>
      <div className={s.terminals}>
        {
          departureDescription &&
          <div className={cx(s.terminal, s.departure)}>
            <div className={cx(s.terminalLabel, s.departure)}>
              <span>Departure</span>
              { 
                (departureDate || departureHour) && 
                <div className={s.time} id="departure">
                  <span className={s.timeDate} id="dept-date-value">
                    {formatDate(departureDate)}
                  </span>
                  <span className={s.timeTime} id="dept-time-value">
                    {formatTime(departureHour, departureMinute)}
                  </span>
                </div>
              }
            </div>
            <div className={s.terminalAddress}>
              {departureAddress}
            </div>
            <div className={s.terminalDescription}>
              {departureDescription}
            </div>
          </div>
        }
        {
          arrivalDescription &&
          <div className={cx(s.terminal, s.arrival)}>
            <div className={cx(s.terminalLabel, s.arrival)}>
              <span>Arrival</span>
              { 
                (arrivalDate || arrivalHour) && 
                <div className={s.time} id="arrival">
                  <span className={s.timeDate} id="arr-date-value">
                    {formatDate(arrivalDate)}
                  </span>
                  <span className={s.timeTime} id="arr-time-value">
                    {formatTime(arrivalHour, arrivalMinute)}
                  </span>
                </div>
              }
            </div>
            <div className={s.terminalAddress}>
              {arrivalAddress}
            </div>
            <div className={s.terminalDescription}>
              {arrivalDescription}
            </div>
          </div>
        }
      </div>
      <div className={s.bottomSection}>
        <div className={s.instanceMap}>
          {renderMap()}
        </div>
        <div className={s.costAndDesc}>
          <div className={s.ratingsAndVotes}>
            { 
              (user || (avgAvailabilityRating || avgDepartureRating || avgArrivalRating || avgAwesomeRating)) &&
              <div className={s.ratings}>
                <div className={s.ratingsHeader}>
                  Ratings
                </div>
                { 
                  (user || avgAvailabilityRating) &&
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
                      <span>{truncate(avgAvailabilityRating, 4)}</span>
                    </div>
                    <div className={s.avgRatingValue}>
                      {truncate(avgAvailabilityRating, 4)}
                    </div>
                  </div>
                }
                {
                  (user || avgDepartureRating) &&
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
                      <span>{truncate(avgDepartureRating, 4)}</span>
                    </div>
                    <div className={s.avgRatingValue}>
                      {truncate(avgDepartureRating, 4)}
                    </div>
                  </div>
                }
                {
                  (user || avgArrivalRating) &&
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
                      <span>{truncate(avgArrivalRating, 4)}</span>
                    </div>
                    <div className={s.avgRatingValue}>
                      {truncate(avgArrivalRating, 4)}
                    </div>
                  </div>
                }
                {
                  (user || avgAwesomeRating) &&
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
                      <span>{truncate(avgAwesomeRating, 4)}</span>
                    </div>
                    <div className={s.avgRatingValue}>
                      {truncate(avgAwesomeRating, 4)}
                    </div>
                  </div>
                }
              </div>
            }
            <div className={s.bottomScore}>
              <div id="bottom-score" className={cx(s.score, !avgRating ? s.hidden : '')}>
                <div className={s.scoreLabel}>
                  <i className="material-icons">stars</i>
                </div>
                <div id="bottom-score-value" className={s.scoreValue}>
                  {truncate(avgRating, 4)}
                </div>
              </div>
              <div className={s.vote}>
                <div className={s.voteLabel}>
                  VOTE!
                </div>
                <div id="bottom-up-vote" className={s.voteButtons}>
                  <i id="bottom-upvotes-button"
                    className={cx(s.voteButton, s.voteUp, s.pulsar1, "material-icons")}
                    onClick={() => vote(uuid, 'upVotes')}>
                    sentiment_very_satisfied
                  </i>
                  <span id="bottom-upvotes-value"
                    className={cx(s.voteValue, s.voteUp)}>
                    { upVotes || linkInstance.upVotes }
                  </span>
                  <i id="bottom-downvotes-button"
                    className={cx(s.voteButton, s.voteDown, s.pulsar2, "material-icons")}
                    onClick={() => vote(uuid, 'downVotes')}>
                    sentiment_very_dissatisfied
                  </i>
                  <span id="bottom-downvotes-value" 
                    className={cx(s.voteValue, s.voteDown)}>
                    { downVotes || linkInstance.downVotes }
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span id="desc-value">{description}</span>
          </div>
        </div>
      </div>
      <div className={s.instanceMediaSection}>
        <LinkInstanceMedia linkInstance={linkInstance} />
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    user: state.auth.auth.user,
    ratings: state.viewLinkInstance.ratings,
    upVotes: state.viewLinkInstance.upVotes,
    downVotes: state.viewLinkInstance.downVotes
  }), {
    saveRating,
    setProperty,
    vote
  })(withStyles(s)(ViewLinkInstance))
);
