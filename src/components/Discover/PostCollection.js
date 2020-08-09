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

const PostCollection = ({ discovery, checkInItem, transportTypes, posts, env, children, intl }) => {

  const { groupName, postCount } = discovery;

  const secondaryPosts = posts.filter(post => ((checkInItem && checkInItem.posts) || []).map(post => post.uuid).indexOf(post.uuid) === -1);

  if (secondaryPosts.length === 0) {
    return (
      <div className={s.secondaryPosts}>
        <div className={s.secondaryPost}>
          <div className={s.postCount}>
            <Link to={`/?locality=${groupName}`}>
              <div>{ postCount }</div>
              <div>posts</div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let secondaryPostsElem = null;
  if (secondaryPosts.length > 0) {
    secondaryPostsElem = (
      <div className={s.secondaryPosts}>
        {
          secondaryPosts.map(post => {
            const { mediaItems } = post;
            return (
              <div key={post.uuid} className={s.secondaryPost}>
                <img src={env.MEDIA_URL + mediaItems[0].url} width="100%"/>
              </div>
            );
          })
        }
        <div className={s.secondaryPost}>
          <div className={s.postCount}>
            <Link to={`/?locality=${groupName}`}>
              <div>{ postCount }</div>
              <div>posts</div>
            </Link>
          </div>
        </div>
      </div>
    );
  } else {
    secondaryPostsElem = (
      <div className={s.secondaryPosts}>
      </div>
    );
  }

  if (secondaryPosts.length === 0) {
    return (
      <div className={s.secondaryPosts}>
      </div>
    );
  }

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
