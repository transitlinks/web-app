import React from 'react';
import cx from 'classnames';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Post from '../Post';
import Terminal from '../Terminal';
import s from './CheckInItemContent.css';
import FontIcon from 'material-ui/FontIcon';
import { setDeepProperty, setProperty } from '../../actions/properties';
import PropTypes from 'prop-types';

const CheckInItemContent = ({
  checkInItem, contentType, feedProperties, frameId, editPost, addPost, savedPost, savedTerminal, feedItemIndex,
  setDeepProperty, setProperty, editable
}) => {

  const { checkIn, posts, terminals } = checkInItem;

  const arrivals = terminals.filter(terminal => terminal.type === 'arrival');
  const arrival = arrivals.length > 0 ? arrivals[0] : null;

  const departures = terminals.filter(terminal => terminal.type === 'departure');
  const departure = departures.length > 0 ? departures[0] : null;

  const savedArrival = savedTerminal && savedTerminal.type === 'arrival' ? savedTerminal : null;
  const savedDeparture = savedTerminal && savedTerminal.type === 'departure' ? savedTerminal : null;

  let content = null;

  const scrollToPost = (postIndex) => {
    setProperty('posts.savedPost', null);
    setDeepProperty('posts', ['feedProperties', frameId, 'activePost'], postIndex);
  };

  let activePost = 0;

  if (posts.length > 0 && contentType === 'reaction') {
    activePost = ((feedProperties && feedProperties[frameId]) && feedProperties[frameId]['activePost']) || 0;

    /*
    if (savedPost) {
      for (let i = 0; i < posts.length; i++) {
        if (posts[i].uuid === savedPost.uuid) {
          activePost = i;
          posts[activePost] = savedPost;
        }
      }
    }
    */

    if (activePost > posts.length - 1) {
      console.log('post out of bounds', feedProperties, activePost, frameId, posts);
      activePost = 0;
    }

    if (posts.length > 0) {

      const indicatorDots = [];
      if (posts.length > 1) {
        for (let i = 0; i < posts.length; i++) {
          indicatorDots.push(
            <div key={`indicator-dot-${i}`} className={cx(s.indicatorDot, i === activePost ? s.selectedIndicatorDot : {})}>
            </div>
          );
        }
      }

      content = (
        <div className={s.posts}>
          <Post post={posts[activePost || 0]} />
          {
            activePost > 0 &&
            <div className={s.navLeft} onClick={() => scrollToPost(activePost - 1)}>
              <FontIcon className="material-icons" style={{ fontSize: '40px' }}>keyboard_arrow_left</FontIcon>
            </div>
          }
          {
            activePost < posts.length - 1 &&
            <div className={s.navRight} onClick={() => scrollToPost(activePost + 1)}>
              <FontIcon className="material-icons" style={{ fontSize: '40px' }}>keyboard_arrow_right</FontIcon>
            </div>
          }
          <div className={s.navIndicatorContainer}>
            <div className={s.navIndicator}>
              {indicatorDots}
            </div>
          </div>
        </div>
      );

    } else {

      content = null;

    }

  } else if (contentType === 'arrival' && arrival) {
    content = <Terminal terminal={arrival} />;
  } else if (contentType === 'departure' && departure) {
    content = <Terminal terminal={departure} />;
  }

  const showHeader = content && content.length !== 0;

  const userName = checkIn.user || 'Anonymoyus';
  const dateStr = (new Date(checkIn.date)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={s.feedItemContent} id={`content-${frameId}`}>
      {
        showHeader &&
        <div className={s.contentHeader}>
          <div className={s.contentHeaderLeft}>
            <div className={s.userIcon}>
            </div>
            <div className={s.contentInfo}>
              <div className={s.contentUser}>
                { userName }
              </div>
              <div className={s.contentDate}>
                { dateStr }
              </div>
            </div>
          </div>
          <div className={s.contentHeaderRight}>
            {
              (!editPost.uuid && editable && checkInItem.userAccess === 'edit') &&
              <FontIcon className="material-icons" style={{ fontSize: '20px' }} onClick={() => {
                if (contentType === 'reaction') {
                  setProperty('posts.addType', 'reaction');
                  setProperty('posts.postText', posts[activePost].text);
                  setProperty('posts.editPost', posts[activePost]);
                  setProperty('posts.mediaItems', posts[activePost].mediaItems);
                } else if (contentType === 'arrival') {
                  setProperty('posts.addType', 'arrival');
                  setProperty('editTerminal.terminal', arrival);
                } else if (contentType === 'departure') {
                  setProperty('posts.addType', 'departure');
                  setProperty('editTerminal.terminal', departure);
                }
              }}>edit</FontIcon>
            }
          </div>
        </div>
      }
      {content}
    </div>
  );

};

CheckInItemContent.propTypes = {
  checkInItem: PropTypes.object,
  contentType: PropTypes.string
};

export default injectIntl(
  connect(state => ({
    env: state.env,
    feedProperties: state.posts.feedProperties || {},
    savedPost: state.posts.savedPost,
    addPost: state.posts.addPost,
    savedTerminal: state.editTerminal.savedTerminal
  }), {
    setDeepProperty, setProperty
  })(withStyles(s)(CheckInItemContent))
);