import React from 'react';
import cx from 'classnames';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Post from '../Post';
import Terminal from '../Terminal';
import Link from '../Link';
import s from './CheckInItemContent.css';
import FontIcon from 'material-ui/FontIcon';
import { setDeepProperty, setProperty } from '../../actions/properties';
import { saveCheckIn, deletePost, deleteTerminal } from '../../actions/posts';
import PropTypes from 'prop-types';
import { saveLike } from '../../actions/comments';

const CheckInItemContent = ({
  checkInItem, contentType, feedProperties, frameId, editPost, showSettings,
  savedTerminal, feedItemIndex, savedCheckIn, feedUpdated,
  setDeepProperty, setProperty, saveCheckIn, deletePost, deleteTerminal, saveLike, editable
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
            {
              checkIn.userImage &&
                <Link to={`/?user=${checkIn.userUuid}`}>
                  <div className={s.userIcon}>
                    <img src={checkIn.userImage} />
                  </div>
                </Link>
            }
            <div className={s.contentInfo}>
              <Link to={`/?user=${checkIn.userUuid}`}>
                <div className={s.contentUser}>
                  { userName }
                </div>
              </Link>
              <div className={s.contentDate}>
                { dateStr }
              </div>
            </div>
          </div>
          <div className={s.contentHeaderRight}>
            {
              (!editPost.uuid && editable && checkInItem.userAccess === 'edit') ?
                <div>
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
                  <FontIcon className="material-icons" style={{ fontSize: '20px', marginLeftt: '4px' }} onClick={() => {
                    if (contentType === 'reaction') {
                      deletePost(posts[activePost].uuid);
                    } else if (contentType === 'arrival') {
                      deleteTerminal(arrival.uuid);
                    } else if (contentType === 'departure') {
                      deleteTerminal(departure.uuid);
                    }
                  }}>delete</FontIcon>
                </div> :
                <div>
                  <div className={s.likes}>
                    <div className={s.heart}>
                      {
                        checkIn.likedByUser ?
                          <FontIcon className="material-icons" style={{ fontSize: '20px', color: 'red' }}
                                    onClick={() => saveLike(checkIn.uuid, 'CheckIn', 'off')}>
                            favorite
                          </FontIcon> :
                          <FontIcon className="material-icons" style={{ fontSize: '20px' }}
                                    onClick={() => saveLike(checkIn.uuid, 'CheckIn', 'on')}>
                            favorite_border
                          </FontIcon>
                      }
                    </div>
                    <div className={s.count}>
                      { checkIn.likes }
                    </div>
                  </div>
                </div>

            }
          </div>
        </div>
      }
      {content}
      <div className={s.tags}>
        {
          showSettings ?
            (checkIn.tags || []).map(tag => (
              <div className={s.removableTag}>
                <div className={s.tagValue}>#{tag}</div>
                <div className={s.removeTag} onClick={() => {
                  console.log('remove tag', tag);
                  saveCheckIn({ checkIn: { uuid: checkIn.uuid, tags: checkIn.tags.filter(t => t !== tag)}})
                }}>
                  <FontIcon className="material-icons" style={{ fontSize: '16px', color: '#9a0000' }}>
                    remove_circle_outline
                  </FontIcon>
                </div>
              </div>
            )) :
            (checkIn.tags || []).map(tag => (
              <div key={`${checkIn.uuid}-${tag}`} className={s.tag}>#<Link to={`/?tags=${tag}&user=${checkIn.userUuid}`}>{tag}</Link></div>
            ))
        }
      </div>
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
    savedTerminal: state.editTerminal.savedTerminal,
    showSettings: state.posts.showSettings,
    savedCheckIn: state.posts.checkIn,
    feedUpdated: state.posts.feedUpdated
  }), {
    setDeepProperty, setProperty, saveCheckIn, deletePost, deleteTerminal, saveLike
  })(withStyles(s)(CheckInItemContent))
);
