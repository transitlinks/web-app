import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import Post from '../Post';
import Terminal from '../Terminal';
import CheckInItem from '../CheckInItem';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Discover.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const PostCollection = ({ transportTypes, groupName, posts, env, children, intl }) => {

  if (posts.length === 0) {
    return null;
  }

  let secondaryPosts = [];
  if (posts.length > 1) {
    secondaryPosts = posts.filter(post => post.mediaItems.length > 0).slice(1, 3);
  }

  let secondaryPostsElem = null;
  if (secondaryPosts.length > 0) {
    secondaryPostsElem = (
      <div className={s.secondaryPosts}>
        {
          secondaryPosts.map(post => {
            const { mediaItems } = post;
            return (
              <div className={s.secondaryPost}>
                <img src={env.MEDIA_URL + mediaItems[0].url} width="100%"/>
              </div>
            );
          })
        }
        <div className={s.secondaryPost}>
          <div className={s.postCount}>
            <Link to={`/?locality=${groupName}`}>
              <div>{ posts.length }</div>
              <div>posts</div>
            </Link>
          </div>
        </div>
      </div>
    );
  } else {
    secondaryPostsElem = (
      <div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div></div>
    );
  }


  const { formattedAddress } = posts[0].checkIn;
  const mainPostHeader = (
    <div className={s.mainPostHeader}>
      { formattedAddress }
    </div>
  );

  const mainPost = posts.length > 1 ? posts[1] : posts[0];

	return (
    <div className={s.postCollection}>
      { secondaryPostsElem }
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    env: state.env
  }), {
  })(withStyles(s)(PostCollection))
);
