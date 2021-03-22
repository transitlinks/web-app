import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FeedItem.css';
import FontIcon from 'material-ui/FontIcon';
import CheckInItemContent from '../CheckInItemContent';
import { setProperty, setDeepProperty } from '../../actions/properties';
import { getFeedItem, deleteCheckIn, saveCheckIn } from '../../actions/checkIns';
import Link from '../Link';
import Terminal from '../EditCheckInItem/Terminal';
import EditCheckInItem from '../EditCheckInItem';
import CheckInControls from '../CheckIn/CheckInControls';
import { GoogleMap, Marker, withGoogleMap, withScriptjs } from 'react-google-maps';


const MapWithAMarker = withScriptjs(withGoogleMap(props =>
  <GoogleMap
    defaultZoom={12}
    defaultCenter={{ lat: props.checkIn.latitude, lng: props.checkIn.longitude }}
  >
    <Marker
      position={{ lat: props.checkIn.latitude, lng: props.checkIn.longitude }}
    />
  </GoogleMap>
));

const typeSelector = (iconName, isSelected, onClick, type) => {
  return (
    <div key={`type-selector-${type}`} className={cx(s.contentTypeSelector, isSelected ? s.typeSelected : {})} onClick={() => onClick()}>
      <div>
        <FontIcon className="material-icons" style={{ fontSize: '20px' }}>{iconName}</FontIcon>
      </div>
    </div>
  );
};

class CheckInItem extends React.Component {

  constructor(args) {
    super(args);
    this.touchStart = this.touchStart.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.state = {};
  }

  componentDidMount() {
    const { frameId } = this.props;
    const gesturedZone = document.getElementById(`checkin-${frameId}`);
    gesturedZone.addEventListener('touchstart', this.touchStart, false);
    gesturedZone.addEventListener('touchend', this.touchEnd, false);
  }

  componentWillUnmount() {
    const { frameId } = this.props;
    const gesturedZone = document.getElementById(`checkin-${frameId}`);
    gesturedZone.removeEventListener('touchstart', this.touchStart, false);
    gesturedZone.removeEventListener('touchend', this.touchEnd, false);
  }

  touchStart(event) {
    this.setState({ touchStartX: event.changedTouches[0].screenX });
  }

  touchEnd(event) {
    this.setState({ touchEndX: event.changedTouches[0].screenX });
    this.handleGesture();
  }

  selectCheckIn(checkInUuid, frameId) {

    const { feedItem, getFeedItem, navigate } = this.props;

    if (feedItem) {
      getFeedItem(checkInUuid, frameId);
    } else {
      navigate({ pathname: `/check-in/${checkInUuid}` });
    }

  }

  handleGesture() {

    const { checkInItem, frameId, fetchedFeedItem } = this.props;

    let item = checkInItem;
    if (fetchedFeedItem && fetchedFeedItem.fetchedAt > checkInItem.fetchedAt) {
      item = fetchedFeedItem;
    }

    const { inbound, outbound } = item;

    if (this.state.touchEndX - this.state.touchStartX < -10) {
      if (outbound.length > 0) {
        this.selectCheckIn(outbound[0].uuid, frameId);
      }
    }
    if (this.state.touchEndX - this.state.touchStartX > 10) {
      if (inbound.length > 0) {
        this.selectCheckIn(inbound[0].uuid, frameId);
      }
    }

  }

  render() {

    const {
      checkInItem, frameId, feedProperties, loadingFeedItem, loadingFrameId,
      transportTypes, openTerminals, view,
      showLinks, showSettings, feedItemIndex, fetchedFeedItem,
      setProperty, setDeepProperty, editable, editCheckIn, navigate
    } = this.props;

    let item = checkInItem;
    if (fetchedFeedItem && fetchedFeedItem.fetchedAt > checkInItem.fetchedAt) {
      item = fetchedFeedItem;
    }

    const { checkIn, inbound, outbound, posts } = item;

    const getStateClass = (links) => {

      if (showLinks === frameId && links.length > 0) {

        if (loadingFeedItem === 'loaded' && loadingFrameId === frameId) {
          setTimeout(() => {
            setProperty('posts.loadingFeedItem', null);
            setProperty('posts.loadingFrameId', null);
          }, 100);
          return s.closed;
        } else {
          return s.open;
        }

      } else {
        return s.closed;
      }

    };

    const getInboundClassnames = () => cx(getStateClass(inbound), s.inboundContainer);

    const getOutboundClassnames = () => cx(getStateClass(outbound), s.outboundContainer);

    let contentType = view;
    let frameView = 'content';
    if (feedProperties[frameId]) {
      if (feedProperties[frameId]['contentType']) {
        contentType = feedProperties[frameId]['contentType'];
      }
      if (feedProperties[frameId]['view']) {
        frameView = feedProperties[frameId]['view'];
      }
    }


    const departures = item.terminals.filter(terminal => terminal.type === 'departure');
    const arrivals = item.terminals.filter(terminal => terminal.type === 'arrival');
    const openDepartures = (openTerminals || []).filter(terminal => (
      terminal.type === 'departure' &&
      terminal.checkIn.uuid !== item.checkIn.uuid &&
      !arrivals.find(arr => arr.linkedTerminal.uuid === terminal.uuid)
    ));

    if (!contentType) {
      if (openDepartures.length > 0) contentType = 'arrival';
      else if (item.posts.length > 0) contentType = 'reaction';
      else if (departures.length > 0) contentType = 'departure';
      else if (arrivals.length > 0) contentType = 'arrival';
      else contentType = 'reaction';
    }

    if (!showSettings) {

      if (contentType === 'arrival' && arrivals.length === 0) {
        if (departures.length > 0) contentType = 'departure';
        else contentType = 'reaction';
      }

      if (contentType === 'departure' && departures.length === 0) {
        if (arrivals.length > 0) contentType = 'arrival';
        else contentType = 'reaction';
      }

      if (contentType === 'reaction' && posts.length === 0) {
        if (departures.length > 0) contentType = 'departure';
        else if (arrivals.length > 0) contentType = 'arrival';
      }

    }

    const selectContentType = (value) => {
      setProperty('posts.deleteCandidate', null);
      setProperty('posts.addType', value);
      setDeepProperty('posts', ['feedProperties', frameId, 'contentType'], value);
    };

    let typeSelectors = [];
    if ((editable && showSettings) || item.posts.length > 0) {
      typeSelectors.push(typeSelector('tag_faces', contentType === 'reaction', () => selectContentType('reaction'), 'reaction'));
    }

    if ((editable && showSettings && openDepartures.length === 0) || departures.length > 0) {
      typeSelectors.push(typeSelector('call_made', contentType === 'departure', () => selectContentType('departure'), 'departure'));
    }

    if ((editable && showSettings && openDepartures.length > 0) || arrivals.length > 0) {
      typeSelectors.push(typeSelector('call_received', contentType === 'arrival', () => selectContentType('arrival'), 'arrival'));
    }

    if (typeSelectors.length === 1) {
      typeSelectors = [];
    }

    let showAddTerminal = null;
    if (editable && showSettings) {
      if (contentType === 'arrival' && arrivals.length === 0) {
        showAddTerminal = 'arrival';
      } else if (contentType === 'departure' && departures.length === 0) {
        showAddTerminal = 'departure';
      }
    }

    let addTerminalElem = null;
    if (showAddTerminal === 'arrival') {
      addTerminalElem =
        <Terminal transportTypes={transportTypes} openTerminals={openDepartures} checkIn={checkIn}
                  type="arrival" terminal={{ type: 'arrival' }}/>;
    } else if (showAddTerminal === 'departure') {
      addTerminalElem =
        <Terminal transportTypes={transportTypes} openTerminals={[]} checkIn={checkIn}
                  type="departure" terminal={{ type: 'departure' }}/>;
    }


    return (
      <div className={s.container} id={`checkin-${frameId}`}>
        {
          <div className={getInboundClassnames()}>
            <div className={s.inboundCheckIns}>
              {
                inbound.map((inboundCheckIn, i) => {
                  const { uuid, formattedAddress } = inboundCheckIn;
                  return (
                    <div key={`inbound-${i}`} className={s.linkedCheckIn}
                         onClick={() => this.selectCheckIn(uuid, frameId)}>
                      <div className={s.linkedCheckInDisplay}>
                        {formattedAddress}
                      </div>
                      <div className={s.linkedCheckInControls}></div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        }
        <div className={s.feedItemContainer}>
          <div className={s.feedItemDisplay}>
            {
              !editable ?
                <Link to={`/check-in/${checkIn.uuid}`}>
                  {checkIn.formattedAddress}
                </Link> :
                <span>{checkIn.formattedAddress}</span>
            }
          </div>
          <div className={s.feedItemControls}>
            {
              ((editable && editCheckIn) || ((showLinks === frameId || showSettings))) &&
              <div className={s.linksButton} onClick={() => {
                setProperty('posts.showLinks', '');
                setProperty('posts.showSettings', false);
                setProperty('posts.editCheckIn', false);
              }}>
                <FontIcon className="material-icons" style={{ fontSize: '20px' }}>close</FontIcon>
              </div>
            }
            {
              (item.userAccess === 'edit' && editable && !editCheckIn && showLinks !== frameId && !showSettings) &&
              <div className={s.linksButton}
                   onClick={() => setProperty('posts.showSettings', true)}>
                <FontIcon className="material-icons"
                          style={{ fontSize: '20px' }}>settings</FontIcon>
              </div>
            }
            {
              (showLinks !== frameId && !showSettings) &&
              <div className={s.linksButton}
                   onClick={() => setProperty('posts.showLinks', frameId)}>
                <FontIcon className="material-icons"
                          style={{ fontSize: '20px' }}>unfold_more</FontIcon>
              </div>
            }
          </div>
        </div>
        {
          <div className={getOutboundClassnames()}>
            <div className={s.outboundCheckIns}>
              {
                outbound.map((outboundCheckIn, i) => {
                  const { uuid, formattedAddress } = outboundCheckIn;
                  return (
                    <div key={`outbound-${i}`} className={s.linkedCheckIn}
                         onClick={() => this.selectCheckIn(uuid, frameId)}>
                      <div className={s.linkedCheckInDisplay}>
                        {formattedAddress}
                      </div>
                      <div className={s.linkedCheckInControls}></div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        }

        {
          (loadingFeedItem === 'loading' && loadingFrameId === frameId) ?
            <div className={s.loading}>
              <div className={s.loadingio}>
                <div className={s.ldio}>
                  <div></div>
                </div>
              </div>
            </div> :
            <div>

              {
                (editable && showSettings) ?
                  <div className={s.checkInControls}>
                    <CheckInControls checkIn={checkIn}/>
                  </div> :
                  <div className={s.checkInLocalityAndCountry}>
                    <div className={s.left}>
                      <div className={cx(s.locationElement, s.locality)}>
                        <div className={s.icon}>
                          <FontIcon className="material-icons" style={{
                            fontSize: '21px',
                            color: '#a0a0a0'
                          }}>location_city</FontIcon>
                        </div>
                        <div className={s.label} onClick={() => navigate({
                          pathname: '/',
                          search: `?locality=${checkIn.localityUuid}`
                        })}>
                          {checkIn.locality}
                        </div>
                      </div>
                      <div className={cx(s.locationElement, s.country)}>
                        <div className={s.icon}>
                          <FontIcon className="material-icons"
                                    style={{ fontSize: '21px', color: '#a0a0a0' }}>flag</FontIcon>
                        </div>
                        <div className={s.label} onClick={() => navigate({
                          pathname: '/',
                          search: `?country=${checkIn.country}`
                        })}>
                          {checkIn.country}
                        </div>
                      </div>
                    </div>
                    <div className={s.right}>
                      <div className={s.mapToggle} onClick={() => {
                        setDeepProperty('posts', ['feedProperties', frameId, 'view'], frameView === 'map' ? 'content' : 'map');
                      }}>
                        <div className={s.icon}>
                          <FontIcon className="material-icons"
                                    style={{ fontSize: '21px' }}>{frameView === 'map' ? 'view_compact' : 'map'}</FontIcon>
                        </div>
                      </div>
                    </div>
                  </div>
              }

              {
                frameView !== 'map' ?
                  <div>
                    <div className={s.contentTypeContainer}>
                      <div className={s.contentTypeSelectors}>
                        {typeSelectors}
                      </div>
                    </div>
                    {
                      (showSettings && contentType === 'reaction') &&
                      <div className={s.addPost}>
                        <EditCheckInItem checkInItem={checkInItem}
                                         openTerminals={openTerminals}
                                         transportTypes={transportTypes}
                                         hideContent
                                         frameId="frame-edit"/>
                      </div>
                    }
                    {
                      addTerminalElem ?
                        addTerminalElem :
                        <CheckInItemContent checkInItem={item} feedItemIndex={feedItemIndex}
                                            frameId={frameId} contentType={contentType}
                                            editPost={{}} editable={editable}/>
                    }
                  </div> :
                  <div>
                    <MapWithAMarker
                      googleMapURL={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCqZjEwtftUOFYY0JhkfEiaT28H9I9xKAE&v=3.exp&libraries=geometry,drawing,places`}
                      loadingElement={<div style={{ height: `100%` }}/>}
                      containerElement={<div style={{ height: `400px` }}/>}
                      mapElement={<div style={{ height: `100%` }}/>}
                      checkIn={checkIn}
                    />
                  </div>
              }
            </div>
        }


      </div>
    );

  }

}

export default connect(state => ({
  feedProperties: state.posts.feedProperties || {},
  fetchedFeedItems: state.posts.fetchedFeedItems,
  showLinks: state.posts.showLinks,
  showSettings: state.posts.showSettings,
  loadingFeedItem: state.posts.loadingFeedItem,
  loadingFrameId: state.posts.loadingFrameId,
  propertyUpdated: state.posts.propertyUpdated,
  updateFeedItem: state.posts.updateFeedItem,
  updatedCheckInDate: state.posts.updatedCheckInDate,
  editCheckIn: state.posts.editCheckIn,
  fetchedFeedItem: state.posts.fetchedFeedItem
}), {
  navigate,
  setProperty,
  setDeepProperty,
  getFeedItem,
  deleteCheckIn,
  saveCheckIn
})(withStyles(s)(CheckInItem));
