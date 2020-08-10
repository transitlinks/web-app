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

  const { groupName, groupType, postCount } = discovery;

  let secondaryPosts = posts.filter(post => ((checkInItem && checkInItem.posts) || []).map(post => post.uuid).indexOf(post.uuid) === -1);

  let postCountUrl = `/?locality=${groupName}`;
  if (groupType === 'tag') postCountUrl = `/?tags=${groupName}`;
  else if (groupType === 'user') postCountUrl = `/?user=${groupName}`;

  const postCountElem = (
    <div className={cx(s.secondaryPost, s.lastFrame)}>
      <div className={s.postCount}>
        <Link to={postCountUrl}>
          <div>{ postCount }</div>
          <div>posts</div>
        </Link>
      </div>
    </div>
  );

  secondaryPosts = secondaryPosts.slice(0, 2);

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
        { postCountElem }
      </div>
    );
  } else {
    secondaryPostsElem = (
      <div className={s.secondaryPosts}>
        { postCountElem }
      </div>
    );
  }

	return secondaryPostsElem;

};

export default injectIntl(
  connect(state => ({
    env: state.env
  }), {
  })(withStyles(s)(PostCollection))
);
