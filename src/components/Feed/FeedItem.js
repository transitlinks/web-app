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
import { setProperty } from "../../actions/properties";
import { getFeedItem } from "../../actions/posts";

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

const FeedItem = ({
  index, feedProperties, type, feedItem, selectedFeedItem, loadingFeedItem, showLinks, navigate, setProperty, getFeedItem
}) => {

  const { checkIn, inbound, outbound } = feedItem;

  const selectCheckIn = (checkInUuid, replaceUuid) => {
    getFeedItem(checkInUuid, replaceUuid);
  };

  const getStateClass = (links) => {

    if (showLinks === index && links.length > 0) {

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
    return cx(s.inboundContainer, getStateClass(inbound));
  };

  const getOutboundClassnames = () => {
    return cx(s.outboundContainer, getStateClass(outbound));
  };

  const selectContentType = (value) => {
    if (!feedProperties[index]) feedProperties[index] = {};
    feedProperties[index]['contentType'] = value;
    setProperty('posts.feedProperties', { ...feedProperties });
  };

  let contentType = 'reaction';
  if (feedProperties[index] && feedProperties[index]['contentType']) {
    contentType = feedProperties[index]['contentType'];
  }

  return (
    <div className={s.container}>
      {
        <div className={getInboundClassnames()}>
          <div className={s.inboundCheckIns}>
            {
              inbound.map(inboundCheckIn => {
                const {uuid, latitude, longitude} = inboundCheckIn;
                return (
                  <div className={s.linkedCheckIn} onClick={() => selectCheckIn(uuid, index)}>
                    <div className={s.linkedCheckInDisplay}>
                      {latitude}, {longitude}
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
          (showLinks === index && inbound.length > 0) &&
          <div className={s.inboundArrowBg}>
          </div>
        }
        {
          (showLinks === index && inbound.length > 0) &&
          <div className={s.inboundArrow}>
            <FontIcon className="material-icons" style={{fontSize: '20px'}}>arrow_downward</FontIcon>
          </div>
        }
        <div className={s.feedItemDisplay}>
          { checkIn.latitude }, { checkIn.longitude }
        </div>
        <div className={s.feedItemControls}>
          {
            showLinks === index &&
            <div className={s.linksButton} onClick={() => setProperty('posts.showLinks', '')}>
              <FontIcon className="material-icons" style={{ fontSize: '20px' }}>close</FontIcon>
            </div>
          }
          {
            showLinks !== index &&
            <div className={s.linksButton} onClick={() => setProperty('posts.showLinks', index)}>
              <FontIcon className="material-icons" style={{ fontSize: '20px' }}>unfold_more</FontIcon>
            </div>
          }
        </div>
        {
          (showLinks === index && outbound.length > 0) &&
          <div className={s.outboundArrowBg}>
            <FontIcon className="material-icons" style={{fontSize: '20px'}}>arrow_downward</FontIcon>
          </div>
        }
      </div>
      {
        <div className={getOutboundClassnames()}>
          <div className={s.outboundCheckIns}>
            {
              outbound.map(outboundCheckIn => {
                const { uuid, latitude, longitude } = outboundCheckIn;
                return (
                  <div className={s.linkedCheckIn} onClick={() => selectCheckIn(uuid, index)}>
                    <div className={s.linkedCheckInDisplay}>
                      { latitude }, { longitude }
                    </div>
                    <div className={s.linkedCheckInControls}></div>
                  </div>
                );
              })
            }
          </div>
        </div>
      }

      <div className={s.contentTypeContainer}>
        <div className={s.contentTypeSelectors}>
          { typeSelector('tag_faces', contentType === 'reaction', () => selectContentType('reaction')) }
          { typeSelector('call_received', contentType === 'arrival', () => selectContentType('arrival')) }
          { typeSelector('call_made', contentType === 'departure', () => selectContentType('departure')) }
          { typeSelector('hotel', contentType === 'lodging', () => selectContentType('lodging')) }
        </div>
      </div>

      <FeedItemContent feedItem={feedItem} contentType={contentType} />

    </div>
  );

};

export default connect(state => ({
  feedProperties: state.posts.feedProperties || {},
  showLinks: state.posts.showLinks,
  selectedFeedItem: state.posts.selectedFeedItem,
  loadingFeedItem: state.posts.loadingFeedItem
}), {
  navigate,
  setProperty,
  getFeedItem
})(withStyles(s)(FeedItem));
