import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas } from '../utils';
import s from './FeedItem.css';
import FontIcon from 'material-ui/FontIcon';
import { setProperty } from "../../actions/properties";
import msg from './messages';

const FeedItem = ({
  feedItem, showLinks, navigate, setProperty
}) => {

  const { checkIn, inbound, outbound } = feedItem;

  return (
    <div className={s.container}>
      {
        (showLinks === checkIn.uuid && inbound.length > 0) &&
        <div className={s.inboundContainer}>
          <div className={s.inboundCheckIns}>
            {
              inbound.map(checkIn => {
                return (
                  <div className={s.linkedCheckIn}>
                    <div className={s.linkedCheckInDisplay}>
                      { checkIn.latitude }, { checkIn.longitude }
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
          (showLinks === checkIn.uuid && inbound.length > 0) &&
          <div className={s.inboundArrowBg}>
          </div>
        }
        {
          (showLinks === checkIn.uuid && inbound.length > 0) &&
          <div className={s.inboundArrow}>
            <FontIcon className="material-icons" style={{fontSize: '20px'}}>arrow_downward</FontIcon>
          </div>
        }
        <div className={s.feedItemDisplay}>
          { checkIn.latitude }, { checkIn.longitude }
        </div>
        <div className={s.feedItemControls}>
          {
            showLinks === checkIn.uuid &&
            <div className={s.linksButton} onClick={() => setProperty('posts.showLinks', '')}>
              <FontIcon className="material-icons" style={{ fontSize: '20px' }}>close</FontIcon>
            </div>
          }
          {
            showLinks !== checkIn.uuid &&
            <div className={s.linksButton} onClick={() => setProperty('posts.showLinks', checkIn.uuid)}>
              <FontIcon className="material-icons" style={{ fontSize: '20px' }}>unfold_more</FontIcon>
            </div>
          }
        </div>
        {
          (showLinks === checkIn.uuid && outbound.length > 0) &&
          <div className={s.outboundArrowBg}>
            <FontIcon className="material-icons" style={{fontSize: '20px'}}>arrow_downward</FontIcon>
          </div>
        }
      </div>
      {
        (showLinks === checkIn.uuid && outbound.length > 0) &&
        <div className={s.outboundContainer}>
          <div className={s.outboundCheckIns}>
            {
              outbound.map(checkIn => {
                return (
                  <div className={s.linkedCheckIn}>
                    <div className={s.linkedCheckInDisplay}>
                      { checkIn.latitude }, { checkIn.longitude }
                    </div>
                    <div className={s.linkedCheckInControls}></div>
                  </div>
                );
              })
            }
          </div>
        </div>
      }
    </div>
  );

};

export default connect(state => ({
  showLinks: state.posts.showLinks
}), {
  navigate,
  setProperty
})(withStyles(s)(FeedItem));
