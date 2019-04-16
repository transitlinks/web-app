import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import Post from '../Post';
import Terminal from '../Terminal';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Discover.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const PostCollection = ({ posts, env, children, intl }) => {

  console.log("show post collection", posts);

  if (posts.length === 0) {
    return null;
  }

  let secondaryPosts = [];
  if (posts.length > 1) {
    secondaryPosts = posts.slice(1, 3).filter(post => post.mediaItems.length > 0);
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
            <a href="#">
              <div>{ posts.length }</div>
              <div>posts</div>
            </a>
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

	return (
    <div className={s.postCollection}>
      <div className={s.mainPost}>
        <div className={s.mainPostHeader}>
          { formattedAddress }
        </div>
        <Post post={posts[posts.length > 1 ? 1 : 0]} />
      </div>
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
