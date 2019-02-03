import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas } from '../utils';
import s from './FeedItem.css';
import FontIcon from 'material-ui/FontIcon';
import msg from './messages';

const FeedItem = ({
  post, navigate
}) => {

  return (
    <div key={post.uuid}
      className={s.link} onClick={() => navigate('/post/' + post.uuid)}>
      <div className={s.linkTitle}>
        { post.text }
      </div>
    </div>
  );

};

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(FeedItem));
