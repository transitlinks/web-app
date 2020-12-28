import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import PostCollection from './PostCollection';
import CheckInItem from '../CheckInItem';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Discover.css';
import Link from '../Link';
import { getDiscoveries } from '../../actions/discover';
import { setProperty } from '../../actions/properties';

import { injectIntl } from 'react-intl';
import TextField from 'material-ui/TextField';

const DiscoverView = ({
  getDiscoveries, setProperty, discoverUpdated,
  discover, searchTerm, fetchedFeedItems, loadedDiscover, transportTypes
}) => {

  let discoveries = (loadedDiscover || discover).discoveries;

  const renderTerminalsList = (terminalType, locations, groupName) => {

    return (
      <div className={s.terminalsByType}>
        <div className={cx(s.terminalTypeSummary, terminalType === 'arrival' ? s.terminalTypeSummaryArrivals : s.terminalTypeSummaryDepartures)}>
          <div className={s.destinationList}>
            {
              locations.map((location, i) => (
                <span>
                <a href={`/links?locality=${location}&view=map`}>{location}</a>
                  {
                    (i < locations.length - 1) && (<span>, </span>)
                  }
              </span>
              ))
            }
          </div>
          <div className={s.terminalTypeValue}>
            <Link to={`/links?locality=${groupName}&type=${terminalType}&view=map`}>{locations.length}</Link>
          </div>
          <div className={s.terminalTypeIcon}>
            <FontIcon className="material-icons" style={{ fontSize: '20px' }}>{ terminalType === 'arrival' ? 'call_received' : 'call_made' }</FontIcon>
          </div>
        </div>
      </div>
    );

  };

  const renderLocalityDiscovery = (discovery, index) => {

    const frameId = `discover-${index}`;

    const { posts, feedItem } = discovery;
    const actualFeedItem = fetchedFeedItems[frameId] || feedItem;

    const hasTrips = discovery.trips && discovery.trips.length > 0;
    const hasTags = discovery.tags && discovery.tags.length > 0;

    return (
      <div key={frameId} className={s.discoveryItem}>
        <div className={s.discoveryHeader}>
          <div className={s.discoveryGroupName}>
            <Link to={`/?locality=${discovery.groupId}`}>{ discovery.groupName || 'Unnamed' }</Link>
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
          { discovery.connectionsFrom > 0 && renderTerminalsList('arrival', discovery.connectionsFrom, discovery.groupName) }
          { discovery.connectionsTo > 0 && renderTerminalsList('departure', discovery.connectionsTo, discovery.groupName) }
        </div>
        <div className={s.postSummary}>
          {
            actualFeedItem &&
              <div className={s.left}>
                <CheckInItem checkInItem={actualFeedItem} frameId={frameId}
                             transportTypes={transportTypes} target="discover" />
                {
                  hasTrips &&
                    <div className={s.contentScroller} style={{ direction: 'rtl' }}>
                      <div className={s.scrollingContent} style={{ textAlign: 'right', paddingLeft: '6px' }}>
                        <div className={s.label}>
                          <FontIcon className="material-icons"
                                    style={{ fontSize: '22px' }}>public</FontIcon>
                        </div>
                        {
                          discovery.trips.map(trip => {
                            return (
                              <div className={s.discoveryTrip}>
                                <Link to={`/?trip=${trip.uuid}`}>{ trip.name }</Link>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                }

                {
                  hasTags &&
                  <div className={s.contentScroller}>
                    <div className={s.scrollingContent} style={{ textAlign: 'left' }}>
                      <div className={s.label}>
                        <FontIcon className="material-icons"
                                  style={{ fontSize: '22px' }}>local_offer</FontIcon>
                      </div>
                      {
                        discovery.tags.map(tag => {
                          return (
                            <div className={s.discoveryTag}>
                              #<Link to={`/?tags=${tag.tag}`}>{ tag.tag }</Link>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                }
              </div>
          }
          <div className={s.right}>
            <PostCollection discovery={discovery} checkInItem={actualFeedItem} posts={posts} frameId={frameId} transportTypes={transportTypes} />
          </div>
        </div>
      </div>
    );

  };

  const renderCountryDiscovery = (discovery, index) => {

    const frameId = `discover-${index}`;

    const { posts, feedItem } = discovery;
    const actualFeedItem = fetchedFeedItems[frameId] || feedItem;

    const hasTrips = discovery.trips && discovery.trips.length > 0;
    const hasTags = discovery.tags && discovery.tags.length > 0;

    return (
      <div key={frameId} className={s.discoveryItem}>
        <div className={s.discoveryHeader}>
          <div className={s.discoveryGroupName}>
            <Link to={`/?country=${discovery.groupName}`}>{ discovery.groupName || 'Unnamed' }</Link>
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
          { discovery.connectionsFrom > 0 && renderTerminalsList('arrival', discovery.connectionsFrom, discovery.groupName) }
          { discovery.connectionsTo > 0 && renderTerminalsList('departure', discovery.connectionsTo, discovery.groupName) }
        </div>
        <div className={s.postSummary}>
          {
            actualFeedItem &&
            <div className={s.left}>
              <CheckInItem checkInItem={actualFeedItem} frameId={frameId}
                           transportTypes={transportTypes} target="discover" />
              {
                hasTrips &&
                <div className={s.contentScroller} style={{ direction: 'rtl' }}>
                  <div className={s.scrollingContent} style={{ textAlign: 'right', paddingLeft: '6px' }}>
                    <div className={s.label}>
                      <FontIcon className="material-icons"
                                style={{ fontSize: '22px' }}>public</FontIcon>
                    </div>
                    {
                      discovery.trips.map(trip => {
                        return (
                          <div className={s.discoveryTrip}>
                            <Link to={`/?trip=${trip.uuid}`}>{ trip.name }</Link>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              }

              {
                hasTags &&
                <div className={s.contentScroller}>
                  <div className={s.scrollingContent} style={{ textAlign: 'left' }}>
                    <div className={s.label}>
                      <FontIcon className="material-icons"
                                style={{ fontSize: '22px' }}>local_offer</FontIcon>
                    </div>
                    {
                      discovery.tags.map(tag => {
                        return (
                          <div className={s.discoveryTag}>
                            #<Link to={`/?tags=${tag.tag}`}>{ tag.tag }</Link>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              }
            </div>
          }
          <div className={s.right}>
            <PostCollection discovery={discovery} checkInItem={actualFeedItem} posts={posts} frameId={frameId} transportTypes={transportTypes} />
          </div>
        </div>
      </div>
    );

  };


  const renderTagDiscovery = (discovery, index) => {

    const frameId = `discover-${index}`;

    const { posts, feedItem } = discovery;
    const actualFeedItem = fetchedFeedItems[frameId] || feedItem;

    return (
      <div key={frameId} className={s.discoveryItem}>
        <div className={s.discoveryHeader}>
          <div className={s.discoveryGroupName}>
            <Link to={`/?tags=${discovery.groupName}`}>#{ discovery.groupName }</Link>
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
        <div className={s.postSummary}>
          {
            actualFeedItem &&
              <div className={s.left}>
                <CheckInItem checkInItem={actualFeedItem} frameId={frameId} transportTypes={transportTypes} target="discover" />
                {
                  (discovery.localities && discovery.localities.length > 0) &&
                  <div className={s.discoveryLocalities}>
                    <div className={s.label}>
                      <FontIcon className="material-icons" style={{ fontSize: '22px' }}>location_city</FontIcon>
                    </div>
                    {
                      discovery.localities.map(locality => {
                        return (
                          <div className={s.discoveryLocality}>
                            <Link to={`/?locality=${locality}`}>{ locality }</Link>
                          </div>
                        );
                      })
                    }
                  </div>
                }
              </div>
          }
          <div className={s.right}>
            <PostCollection discovery={discovery} checkInItem={actualFeedItem} posts={posts} frameId={frameId} transportTypes={transportTypes} />
          </div>
        </div>
      </div>
    )

  };

  const renderTripDiscovery = (discovery, index) => {

    const frameId = `discover-${index}`;

    const { posts, feedItem } = discovery;
    const actualFeedItem = fetchedFeedItems[frameId] || feedItem;

    return (
      <div key={frameId} className={s.discoveryItem}>
        <div className={s.discoveryHeader}>
          <div className={s.discoveryGroupName}>
            <Link to={`/?trip=${discovery.groupId}`}>{ discovery.groupName }</Link>
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
        <div className={s.postSummary}>
          {
            actualFeedItem &&
            <div className={s.left}>
              <CheckInItem checkInItem={actualFeedItem} frameId={frameId} transportTypes={transportTypes} target="discover" />
              {
                (discovery.localities && discovery.localities.length > 0) &&
                <div className={s.discoveryLocalities}>
                  <div className={s.label}>
                    <FontIcon className="material-icons" style={{ fontSize: '22px' }}>location_city</FontIcon>
                  </div>
                  {
                    discovery.localities.map(locality => {
                      return (
                        <div className={s.discoveryLocality}>
                          <Link to={`/?locality=${locality}`}>{ locality }</Link>
                        </div>
                      );
                    })
                  }
                </div>
              }
            </div>
          }
          <div className={s.right}>
            <PostCollection discovery={discovery} checkInItem={actualFeedItem} posts={posts} frameId={frameId} transportTypes={transportTypes} />
          </div>
        </div>
      </div>
    )

  };

  const renderUserDiscovery = (discovery, index) => {

    const frameId = `discover-${index}`;

    const { posts, feedItem } = discovery;
    const actualFeedItem = fetchedFeedItems[frameId] || feedItem;

    return (
      <div key={frameId} className={s.discoveryItem}>
        <div className={s.discoveryHeader}>
          <div className={s.discoveryGroupName}>
            <Link to={`/?user=${discovery.groupId}`}>{ discovery.groupName }</Link>
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
        <div className={s.postSummary}>
          {
            actualFeedItem && <CheckInItem checkInItem={actualFeedItem} frameId={frameId} transportTypes={transportTypes} target="discover" />
          }
          <PostCollection discovery={discovery} checkInItem={actualFeedItem} posts={posts} frameId={frameId} transportTypes={transportTypes} />
        </div>
      </div>
    )

  };

  const renderDiscovery = (discovery, index) => {

    if (discovery.groupType === 'locality') {
      return renderLocalityDiscovery(discovery, index);
    } else if (discovery.groupType === 'country') {
      return renderCountryDiscovery(discovery, index);
    } else if (discovery.groupType === 'tag') {
      return renderTagDiscovery(discovery, index);
    } else if (discovery.groupType === 'trip') {
      return renderTripDiscovery(discovery, index);
    } else if (discovery.groupType === 'user') {
      return renderUserDiscovery(discovery, index);
    } else {
      return <div>Unknown discovery type</div>;
    }

  }

  return (
    <div className={s.container}>
      <div className={s.functionBar}>
        <div className={s.searchFieldContainer}>
          <div className={s.search}>
            <FontIcon className={cx(s.searchIcon, 'material-icons')}>search</FontIcon>
            <div className={s.searchField}>
              <TextField id="discover-search-input"
                         value={searchTerm}
                         fullWidth
                         style={{ height: '46px' }}
                         hintText="Origin or destination"
                         onChange={(event) => {
                           const input = event.target.value;
                           setProperty('discover.searchTerm', input);
                           if (input.length > 2) {
                             getDiscoveries({ search: input }, true);
                           } else if (input.length === 0) {
                             getDiscoveries({}, true);
                           }
                         }} />
            </div>
          </div>
        </div>
      </div>
      <div>
        {

          (discoveries || []).map((discovery, index) => {
            return renderDiscovery(discovery, index);
          })
        }
      </div>
    </div>
  );

};

DiscoverView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => {
    return {
      loadedDiscover: state.discover.discover,
      searchTerm: state.discover.searchTerm,
      fetchedFeedItems: state.posts.fetchedFeedItems || {},
      feedUpdated: state.posts.feedUpdated,
      discoverUpdated: state.discover.discoverUpdated
    };
  }, {
    getDiscoveries,
    setProperty
  })(withStyles(s)(DiscoverView))
);
