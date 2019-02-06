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

  const { checkIn, posts } = feedItem;

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

  return (
    <div className={s.feedItemContent}>
      {postElems}
    </div>
  );

};

const FeedView = ({
  feed, loadedFeed, savedCheckIn, navigate
}) => {

  const feedItems = (((loadedFeed || feed) || {}).feedItems || []);

  return (
    <div className={s.container}>
      <div className={s.header}>
      </div>
      <div className={s.results}>
        {
          feedItems.map(feedItem => {
            const { checkIn } = feedItem;
            const editable = savedCheckIn && savedCheckIn.uuid === checkIn.uuid;
            return (
              <div className={s.feedItemContainer} key={checkIn.uuid}>
                { editable ? <Add checkIn={checkIn} /> : <FeedItem checkIn={checkIn} /> }
                { feedItemContent(feedItem) }
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
  savedCheckIn: state.posts.checkIn
}), {
  navigate
})(withStyles(s)(FeedView));
