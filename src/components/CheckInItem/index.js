import React from 'react';
import cx from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas } from '../utils';
import s from './FeedItem.css';
import FontIcon from 'material-ui/FontIcon';
import FeedItemContent from '../FeedItemContent';
import { setProperty, setDeepProperty } from "../../actions/properties";
import { getFeedItem, deleteCheckIn, saveCheckIn } from "../../actions/posts";

import msg from './messages';

const typeSelector = (iconName, isSelected, onClick) => {
  return (
    <div className={cx(s.contentTypeSelector, isSelected ? s.typeSelected : {})} onClick={() => onClick()}>
      <div>
        <FontIcon className="material-icons" style={{ fontSize: '20px' }}>{iconName}</FontIcon>
      </div>
    </div>
  );
};

const CheckInItem = (
  {
    feedItem, frameId, target, feedProperties, fetchedFeedItems, loadingFeedItem, propertyUpdated,
    showLinks, showSettings, updateFeedItem, updatedCheckInDate, post, feedItemIndex,
    navigate, setProperty, setDeepProperty, getFeedItem, deleteCheckIn, saveCheckIn
  }) => {

  const { checkIn, inbound, outbound } = feedItem;

  const selectCheckIn = (checkInUuid, frameId) => {
    getFeedItem(checkInUuid, frameId, target);
  };

  const getStateClass = (links) => {

    if (showLinks === frameId && links.length > 0) {

      if (loadingFeedItem === 'loaded') {
        setTimeout(() => {
          setProperty('posts.loadingFeedItem', null);
        }, 100);
        return s.closed;
      } else {
        return s.open;
      }

    } else {
      return s.closed;
    }

  };

  const getInboundClassnames = () => {
    return cx(getStateClass(inbound), s.inboundContainer);
  };

  const getOutboundClassnames = () => {
    return cx(getStateClass(outbound), s.outboundContainer);
  };

  let contentType = 'reaction';

  const selectContentType = (value) => {
    setDeepProperty('posts', ['feedProperties', frameId, 'contentType'], value);
  };

  if (feedProperties[frameId] && feedProperties[frameId]['contentType']) {
    contentType = feedProperties[frameId]['contentType'];
  }

  let typeSelectors = [];
  let defaultContentType = null;
  if (feedItem.posts.length > 0) {
    typeSelectors.push(typeSelector('tag_faces', contentType === 'reaction', () => selectContentType('reaction')));
    defaultContentType = 'reaction';
  }

  const departures = feedItem.terminals.filter(terminal => terminal.type === 'departure');
  if (departures.length > 0) {
    typeSelectors.push(typeSelector('call_made', contentType === 'departure', () => selectContentType('departure')));
    defaultContentType = 'departure';
  }

  const arrivals = feedItem.terminals.filter(terminal => terminal.type === 'arrival');
  if (arrivals.length > 0) {
    typeSelectors.push(typeSelector('call_received', contentType === 'arrival', () => selectContentType('arrival')));
    defaultContentType = 'arrival';
  }


  if (typeSelectors.length < 2) {
    if (typeSelectors.length === 1) {
      contentType = defaultContentType;
    }
    typeSelectors = null;
  }

  //{ typeSelector('hotel', contentType === 'lodging', () => selectContentType('lodging')) }

  return (
    <div className={s.container} id={`checkin-${frameId}`}>
      {
        <div className={getInboundClassnames()}>
          <div className={s.inboundCheckIns}>
            {
              inbound.map(inboundCheckIn => {
                const {uuid, latitude, longitude, formattedAddress } = inboundCheckIn;
                return (
                  <div className={s.linkedCheckIn} onClick={() => selectCheckIn(uuid, frameId)}>
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
          <a href="#" onClick={() => setProperty('posts.checkIn', checkIn)}>
            { checkIn.formattedAddress }
          </a>
        </div>
        <div className={s.feedItemControls}>
          {
            (showLinks === frameId || showSettings === frameId) &&
            <div className={s.linksButton} onClick={() => {
              setProperty('posts.showLinks', '');
              setProperty('posts.showSettings', '');
            }}>
              <FontIcon className="material-icons" style={{ fontSize: '20px' }}>close</FontIcon>
            </div>
          }
          {
            (showLinks !== frameId && showSettings !== frameId) &&
            <div className={s.settingsButton} onClick={() => setProperty('posts.showSettings', frameId)}>
              <FontIcon className="material-icons" style={{ fontSize: '20px' }}>settings</FontIcon>
            </div>
          }
          {
            (showLinks !== frameId && showSettings !== frameId) &&
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
              outbound.map(outboundCheckIn => {
                const { uuid, latitude, longitude, formattedAddress } = outboundCheckIn;
                return (
                  <div className={s.linkedCheckIn} onClick={() => selectCheckIn(uuid, frameId)}>
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
        showSettings === frameId &&
        (
          !updateFeedItem ?
          <div className={s.feedItemSettings}>
            <div className={s.feedItemSetting}>
              <FontIcon className="material-icons" style={{fontSize: '20px'}} onClick={() => {
                deleteCheckIn({ checkInUuid: checkIn.uuid });
              }}>delete</FontIcon>
            </div>
            <div className={s.feedItemSetting}>
              <FontIcon className="material-icons" style={{fontSize: '20px'}}>share</FontIcon>
              <div className={s.updateFeedItem} onClick={() => {
                setProperty('posts.updateFeedItem', true);
              }}></div>
            </div>
          </div> :
          <div>
            <input type="text" value={updatedCheckInDate || checkIn.date} onChange={(event) => {
              console.log("event target val", event.target.value, "]"+updatedCheckInDate+"[");
              setProperty('posts.updatedCheckInDate', event.target.value);
            }}/>
            <button onClick={() => {
              setProperty('posts.updateFeedItem', false);
              const updatedDate = new Date(updatedCheckInDate);
              saveCheckIn({ checkIn: { uuid: checkIn.uuid, date: updatedDate } });
            }}>OK</button>
          </div>
        )
      }

      <div className={s.contentTypeContainer}>
        <div className={s.contentTypeSelectors}>
          { typeSelectors }
        </div>
      </div>

      <FeedItemContent feedItem={feedItem} feedItemIndex={feedItemIndex} frameId={frameId} contentType={contentType} post={post} />

    </div>
  );

};

export default connect(state => ({
  feedProperties: state.posts.feedProperties || {},
  fetchedFeedItems: state.posts.fetchedFeedItems,
  showLinks: state.posts.showLinks,
  showSettings: state.posts.showSettings,
  loadingFeedItem: state.posts.loadingFeedItem,
  propertyUpdated: state.posts.propertyUpdated,
  updateFeedItem: state.posts.updateFeedItem,
  updatedCheckInDate: state.posts.updatedCheckInDate
}), {
  navigate,
  setProperty,
  setDeepProperty,
  getFeedItem,
  deleteCheckIn,
  saveCheckIn
})(withStyles(s)(CheckInItem));
