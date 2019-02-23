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

const feedItemContent = (feedItem) => {

  const { checkIn, posts, terminals } = feedItem;

  let postElems = null;
  if (posts) {
    postElems = posts.map(post => {
      return (
        <div className={s.post}>
          <div className={s.postInfo}>
            <div className={s.postAuthor}>Anonymous</div>
            <div className={s.postDate}>Feb 4 at 23:11</div>
          </div>
          <div className={s.postText}>{post.text}</div>
          <div className={s.postControls}></div>
        </div>
      );
    });
  }

  let terminalElems = null;
  if (terminals) {
    terminalElems = terminals.map(terminal => {
      return (
        <div className={s.terminal}>
          --{terminal.type}
        </div>
      );
    });
  }

  return (
    <div className={s.feedItemContent}>
      {terminalElems}
      {postElems}
    </div>
  );

};

const FeedView = ({
  feed, transportTypes, loadedFeed, savedCheckIn, fetchedFeedItem
}) => {

  const feedItems = (((loadedFeed || feed) || {}).feedItems || []);
  let editOpen = false;

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
                { editable ? <Add feedItem={feedItem} transportTypes={transportTypes} /> : <FeedItem feedItem={feedItem} index={index} /> }
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
