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
            if (!savedCheckIn || savedCheckIn.uuid !== checkIn.uuid) {
              return <FeedItem checkIn={checkIn} key={checkIn.uuid} />;
            } else {
              return <Add checkIn={checkIn} />
            }

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
