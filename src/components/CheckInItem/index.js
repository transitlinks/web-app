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

const typeSelector = (iconName, isSelected, onClick, type) => {
  return (
    <div key={`type-selector-${type}`} className={cx(s.contentTypeSelector, isSelected ? s.typeSelected : {})} onClick={() => onClick()}>
      <div>
        <FontIcon className="material-icons" style={{ fontSize: '20px' }}>{iconName}</FontIcon>
      </div>
    </div>
  );
};

const CheckInItem = (
  {
    checkInItem, frameId, target, feedProperties, loadingFeedItem, loadingFrameId,
    transportTypes, openTerminals, view,
    showLinks, showSettings, updateFeedItem, updatedCheckInDate, feedItemIndex, feedItem, fetchedFeedItem,
    setProperty, setDeepProperty, getFeedItem, deleteCheckIn, saveCheckIn, editable, editCheckIn, navigate
  }) => {

  let item = checkInItem;
  if (fetchedFeedItem && fetchedFeedItem.fetchedAt > checkInItem.fetchedAt) {
    item = fetchedFeedItem;
  }

  const { checkIn, inbound, outbound, posts } = item;

  const selectCheckIn = (checkInUuid, frameId) => {
    if (feedItem) getFeedItem(checkInUuid, frameId);
    else navigate({ pathname: `/check-in/${checkInUuid}`});
  };

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
  if (feedProperties[frameId] && feedProperties[frameId]['contentType']) {
    contentType = feedProperties[frameId]['contentType'];
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
    addTerminalElem = <Terminal transportTypes={transportTypes} openTerminals={openDepartures} checkIn={checkIn} type="arrival" terminal={{ type: 'arrival' }} />;
  } else if (showAddTerminal === 'departure') {
    addTerminalElem = <Terminal transportTypes={transportTypes} openTerminals={[]} checkIn={checkIn} type="departure" terminal={{ type: 'departure' }} />;
  }

  return (
    <div className={s.container} id={`checkin-${frameId}`}>
      {
        <div className={getInboundClassnames()}>
          <div className={s.inboundCheckIns}>
            {
              inbound.map((inboundCheckIn, i) => {
                const {uuid, formattedAddress } = inboundCheckIn;
                return (
                  <div key={`inbound-${i}`} className={s.linkedCheckIn} onClick={() => selectCheckIn(uuid, frameId)}>
                    <div className={s.linkedCheckInDisplay}>
                      { formattedAddress }
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
        {
          null
          //(showLinks === frameId && inbound.length > 0) &&
          //<div className={s.inboundArrowBg}>
          //</div>
        }
        {
          null
          //(showLinks === frameId && inbound.length > 0) &&
          //<div className={s.inboundArrow}>
          //  <FontIcon className="material-icons" style={{fontSize: '20px'}}>arrow_downward</FontIcon>
          //</div>
        }
        <div className={s.feedItemDisplay}>
          {
            !editable ?
              <Link to={`/check-in/${checkIn.uuid}`}>
                { checkIn.formattedAddress }
              </Link> :
              <span>{ checkIn.formattedAddress }</span>
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
            <div className={s.linksButton} onClick={() => setProperty('posts.showSettings', true)}>
              <FontIcon className="material-icons" style={{ fontSize: '20px' }}>settings</FontIcon>
            </div>
          }
          {
            (showLinks !== frameId && !showSettings) &&
            <div className={s.linksButton} onClick={() => setProperty('posts.showLinks', frameId)}>
              <FontIcon className="material-icons" style={{ fontSize: '20px' }}>unfold_more</FontIcon>
            </div>
          }
        </div>
        {
          null
          //(showLinks === frameId && outbound.length > 0) &&
          //<div className={s.outboundArrowBg}>
          //  <FontIcon className="material-icons" style={{fontSize: '20px'}}>arrow_downward</FontIcon>
          //</div>
        }
      </div>
      {
        <div className={getOutboundClassnames()}>
          <div className={s.outboundCheckIns}>
            {
              outbound.map((outboundCheckIn, i) => {
                const { uuid, formattedAddress } = outboundCheckIn;
                return (
                  <div key={`outbound-${i}`} className={s.linkedCheckIn} onClick={() => selectCheckIn(uuid, frameId)}>
                    <div className={s.linkedCheckInDisplay}>
                      { formattedAddress }
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
              (editable && showSettings) &&
              <div className={s.checkInControls}>
                <CheckInControls checkIn={checkIn} />
              </div>
            }

            <div className={s.contentTypeContainer}>
              <div className={s.contentTypeSelectors}>
                { typeSelectors }
              </div>
            </div>
            {
              (showSettings && contentType === 'reaction') &&
              <div className={s.addPost}>
                <EditCheckInItem checkInItem={checkInItem}
                                 openTerminals={openTerminals}
                                 transportTypes={transportTypes}
                                 hideContent
                                 frameId="frame-edit" />
              </div>
            }
            {
              addTerminalElem ?
                addTerminalElem :
                <CheckInItemContent checkInItem={item} feedItemIndex={feedItemIndex} frameId={frameId} contentType={contentType} editPost={{}} editable={editable} />
            }
          </div>
      }


    </div>
  );

};

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
