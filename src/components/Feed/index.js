import React from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Feed.css';
import EditCheckInItem from '../EditCheckInItem';
import CheckInItem from '../CheckInItem';


const FeedView = ({ feed, transportTypes, post, loadedFeed, savedCheckIn, fetchedFeedItems, feedUpdated, user }) => {

  const currentFeed = (loadedFeed || feed) || {};
  const feedItems = (currentFeed.feedItems || []).map(feedItem => {
    return { ...feedItem };
  });
  const openTerminals = (currentFeed.openTerminals || []).map(terminal => {
    return { ...terminal, id: terminal.uuid };
  });

  const hideFeedItem = (feedItem, frameId) => {
    const { checkIn, terminals, posts } = feedItem;
    return (
      frameId !== 'frame-new' &&
      terminals.length === 0 && posts.length === 0 &&
      checkIn.userUuid !== user.uuid
    );
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
      </div>
      <div className={s.results}>
        {
          feedItems.map((feedItem, index) => {

            const { checkIn } = feedItem;

            const editable = savedCheckIn && savedCheckIn.uuid === checkIn.uuid;

            const frameId = editable ? 'frame-new' : `feed-${checkIn.uuid}`;
            const fetchedFeedItem = fetchedFeedItems[frameId];

            if (hideFeedItem(feedItem, frameId)) {
              return null;
            }

            return (
              <div className={s.feedItem} key={`${checkIn.uuid}-${index}`} id={`feed-item-${index}`}>
                {
                  ((post && post.checkInUuid === checkIn.uuid) || editable) ?
                    <EditCheckInItem checkInItem={(fetchedFeedItem || feedItem)}
                         openTerminals={openTerminals}
                         transportTypes={transportTypes}
                         frameId
                         newCheckIn />
                    : <CheckInItem checkInItem={(fetchedFeedItem || feedItem)} feedItemIndex={index} frameId={frameId} transportTypes={transportTypes} editable={false} feedItem />
                }
              </div>
            );

          })
        }
      </div>
    </div>
  );
};

export default connect(state => {

  return {
    loadedFeed: state.posts.feed,
    savedCheckIn: state.posts.checkIn,
    fetchedFeedItems: state.posts.fetchedFeedItems || {},
    feedUpdated: state.posts.feedUpdated,
    user: state.auth.auth.user || {}
  };

}, {
  navigate
})(withStyles(s)(FeedView));
