import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Feed.css';
import FontIcon from 'material-ui/FontIcon';
import Link from '../Link';
import FeedItem from './FeedItem';
import Add from '../Add';
import CheckInItem from '../CheckInItem';
import msg from './messages';


const FeedView = ({
  feed, transportTypes, loadedFeed, savedCheckIn, fetchedFeedItems, feedUpdated
}) => {

  const currentFeed = (loadedFeed || feed) || {};
  const feedItems = (currentFeed.feedItems || []).map(feedItem => {
    return { ...feedItem };
  });
  const openTerminals = (currentFeed.openTerminals || []).map(terminal => {
    return { ...terminal, id: terminal.uuid };
  });


  let editOpen = false;

  return (
    <div className={s.container}>
      <div className={s.header}>
      </div>
      <div className={s.results}>
        {
          feedItems.map((feedItem, index) => {

            const frameId = `feed-${index}`;
            const { checkIn } = feedItem;

            const editable = savedCheckIn && savedCheckIn.uuid === checkIn.uuid && !editOpen;
            if (editable) editOpen = true;

            const fetchedFeedItem = fetchedFeedItems[frameId];

            return (
              <div className={s.feedItem} key={`${checkIn.uuid}-${index}`}>
                {
                  editable ?
                    <Add feedItem={feedItem}
                         openTerminals={openTerminals}
                         transportTypes={transportTypes} />
                    : <CheckInItem feedItem={(fetchedFeedItem || feedItem)} frameId={frameId} transportTypes={transportTypes} />
                }
              </div>
            );

          })
        }
      </div>
    </div>
  );
};

export default connect(state => ({
  loadedFeed: state.posts.feed,
  savedCheckIn: state.posts.checkIn,
  fetchedFeedItems: state.posts.fetchedFeedItems || {},
  feedUpdated: state.posts.feedUpdated
}), {
  navigate
})(withStyles(s)(FeedView));
