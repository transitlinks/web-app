import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Feed.css';
import FontIcon from 'material-ui/FontIcon';
import Link from '../Link';
import FeedItem from './FeedItem';
import msg from './messages';

const FeedView = ({
  posts, navigate
}) => {
  
  return (
    <div className={s.container}>
      <div className={s.header}>
      </div>
      <div className={s.results}>
        {
          (posts || []).map(post => {
            return <FeedItem post={post} />
          })
        }
      </div>
    </div>
  );
};

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(FeedView));
