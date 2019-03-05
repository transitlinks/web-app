import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Feed.css';
import FontIcon from 'material-ui/FontIcon';
import Link from '../Link';
import FeedItem from './FeedItem';
import Add from '../Add'
import msg from './messages';


const FeedView = ({
  feed, transportTypes, loadedFeed, savedCheckIn, fetchedFeedItem
}) => {

  const currentFeed = (loadedFeed || feed) || {};
  const feedItems = (currentFeed.feedItems || []).map(feedItem => {
    return { ...feedItem };
  });
  const openTerminals = (currentFeed.openTerminals || []).map(terminal => {
    console.log("otuuid", terminal.uuid);
    return { ...terminal, id: terminal.uuid };
  });


  let editOpen = false;
  console.log("feed view", loadedFeed, feed, currentFeed);

  return (
    <div className={s.container}>
      <div className={s.header}>
      </div>
      <div className={s.results}>
        {
          feedItems.map((feedItem, index) => {

            const { checkIn } = feedItem;

            const editable = savedCheckIn && savedCheckIn.uuid === checkIn.uuid && !editOpen;
            if (editable) editOpen = true;

            return (
              <div className={s.feedItem} key={`${checkIn.uuid}-${index}`}>
                {
                  editable ?
                    <Add feedItem={feedItem}
                         openTerminals={openTerminals}
                         transportTypes={transportTypes} />
                    : <FeedItem feedItem={feedItem} index={index} transportTypes={transportTypes} />
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
  fetchedFeedItem: state.posts.fetchedFeedItem
}), {
  navigate
})(withStyles(s)(FeedView));
