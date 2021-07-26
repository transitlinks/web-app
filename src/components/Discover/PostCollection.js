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
import FontIcon from 'material-ui/FontIcon';

const PostCollection = ({ discovery, checkInItem, transportTypes, posts, env, children, intl }) => {

  const { groupName, groupId, groupType, postCount, connectionCount, localityCount, localities, tags } = discovery;

  let secondaryPosts = posts.filter(post => ((checkInItem && checkInItem.posts) || []).map(post => post.uuid).indexOf(post.uuid) === -1);

  let postCountUrl = `/?locality=${groupName}`;
  if (groupType === 'tag') postCountUrl = `/?tags=${groupName}`;
  else if (groupType === 'user') postCountUrl = `/?user=${groupName}`;

  let connectionCountUrl = null;
  if (groupType === 'locality') connectionCountUrl = `/links?locality=${groupId}&view=map`;
  else if (groupType === 'trip') connectionCountUrl = `/links?trip=${groupId}&view=map`;
  else if (groupType === 'user') connectionCountUrl = `/links?user=${groupName}&view=map`;

  const discoveryStatsElem = (
    <div className={cx(s.secondaryPost, s.lastFrame)}>
      <div className={s.discoveryStats}>
        <div className={s.discoveryStatItem}>
          <div className={s.discoveryStatIconAndNumber}>
            <div className={s.discoveryStatIcon}>
              <FontIcon className="material-icons" style={{ fontSize: '24px' }}>insert_photo</FontIcon>
            </div>
            <div className={s.discoveryStatNumber}>
              <Link to={postCountUrl}> { postCount }</Link>
            </div>
          </div>
          <div className={s.discoveryStatText}>
            posts
          </div>
        </div>
        <div className={s.discoveryStatItem}>
          <div className={s.discoveryStatIconAndNumber}>
            <div className={s.discoveryStatIcon}>
              <FontIcon className="material-icons" style={{ fontSize: '24px' }}>directions</FontIcon>
            </div>
            <div className={s.discoveryStatNumber}>
              {
                connectionCountUrl ?
                  <Link to={connectionCountUrl}> { connectionCount }</Link> :
                  <span> { connectionCount }</span>
              }
            </div>
          </div>
          <div className={s.discoveryStatText}>
            connections
          </div>
        </div>
        {
          groupType === 'tag' &&
            <div className={s.discoveryStatItem}>
              <div className={s.discoveryStatIconAndNumber}>
                <div className={s.discoveryStatIcon}>
                  <FontIcon className="material-icons" style={{ fontSize: '24px' }}>public</FontIcon>
                </div>
                <div className={s.discoveryStatNumber}>
                  <Link to={postCountUrl}> { localityCount }</Link>
                </div>
              </div>
              <div className={s.discoveryStatText}>
                places
              </div>
            </div>
        }
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
                <img src={env.MEDIA_URL + mediaItems[0].url} width="100%" />
              </div>
            );
          })
        }
        { discoveryStatsElem }
      </div>
    );
  } else {
    secondaryPostsElem = (
      <div className={s.secondaryPosts}>
        { discoveryStatsElem }
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
