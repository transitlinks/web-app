import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import PostCollection from './PostCollection';
import Terminal from '../Terminal';
import CheckInItem from '../CheckInItem';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Discover.css';
import Link from '../Link';
import { getDiscoveries } from '../../actions/discover';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const DiscoverView = ({ discover, fetchedFeedItems, loadedDiscover, feedUpdated, transportTypes, children, intl }) => {

  let discoveries = (loadedDiscover || discover).discoveries;

  const renderTerminalsList = (terminalType, locations, groupName) => {

    /*
    const terminalLocations = {
      "St. Petersburg": 1,
      "New York": 1,
      "Calcutta": 1,
      "Paris": 1,
      "Minneapolis": 1
    };
    */

    return (
      <div className={s.terminalsByType}>
        <div className={cx(s.terminalTypeSummary, terminalType === 'arrival' ? s.terminalTypeSummaryArrivals : s.terminalTypeSummaryDepartures)}>
          <div className={s.destinationList}>
            {
              locations.map((location, i) => (
                <span>
                <a href={`/links?locality=${location}`}>{location}</a>
                  {
                    (i < locations.length - 1) && (<span>, </span>)
                  }
              </span>
              ))
            }
          </div>
          <div className={s.terminalTypeValue}>
            <Link to={`/links?locality=${groupName}&type=${terminalType}`}>{locations.length}</Link>
          </div>
          <div className={s.terminalTypeIcon}>
            <FontIcon className="material-icons" style={{ fontSize: '20px' }}>{ terminalType === 'arrival' ? 'call_received' : 'call_made' }</FontIcon>
          </div>
        </div>
      </div>
    );
  };

	return (
    <div className={s.container}>
      <div>
        {

          (discoveries || []).map((discovery, index) => {

            const frameId = `discover-${index}`;

            const { posts, departures, arrivals, feedItem } = discovery;

            return (
              <div key={discovery.groupName} className={s.discoveryItem}>
                <div className={s.discoveryHeader}>
                  <div className={s.discoveryGroupName}>
                    { discovery.groupName || 'Unnamed' }
                  </div>
                  <div className={s.discoveryHeaderControls}>
                    <div className={s.checkInCount}>
                      <div className={s.checkInCountIcon}>
                        <FontIcon className="material-icons" style={{ fontSize: '16px' }}>place</FontIcon>
                      </div>
                      <div className={s.checkInCountValue}>
                        { discovery.checkInCount }
                      </div>
                    </div>
                  </div>
                </div>
                <div className={s.terminalSummary}>
                  { renderTerminalsList('arrival', discovery.connectionsFrom, discovery.groupName) }
                  { renderTerminalsList('departure', discovery.connectionsTo, discovery.groupName) }
                </div>
                <div className={s.postSummary}>
                  <CheckInItem feedItem={fetchedFeedItems[frameId] || feedItem} frameId={frameId} transportTypes={transportTypes} target="discover" />
                  <PostCollection posts={posts} frameId={frameId} transportTypes={transportTypes} />
                </div>
              </div>
            )

          })
        }
      </div>
    </div>
  );

};

DiscoverView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    loadedDiscover: state.discover.discover,
    fetchedFeedItems: state.posts.fetchedFeedItems || {},
    feedUpdated: state.posts.feedUpdated
  }), {
    getDiscoveries
  })(withStyles(s)(DiscoverView))
);
