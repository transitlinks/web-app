import React from 'react';
import cx from 'classnames';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Post from '../Post';
import Terminal from '../Terminal';
import Link from '../Link';
import Comments from '../Comments';
import s from './CheckInItemContent.css';
import FontIcon from 'material-ui/FontIcon';
import { setDeepProperty, setProperty } from '../../actions/properties';
import { deletePost, deleteTerminal } from '../../actions/posts';
import { saveCheckIn } from '../../actions/checkIns';
import PropTypes from 'prop-types';
import { saveLike, saveComment } from '../../actions/comments';
import DeleteContentDialog from '../common/DeleteContentDialog';
import { getImageUrl } from '../utils';

const CheckInItemContent = ({
  checkInItem, contentType, feedProperties, frameId, editPost, showSettings, env,
  savedTerminal, sentLike, deleteCandidate,
  setDeepProperty, setProperty, saveCheckIn, deletePost, deleteTerminal, saveLike,
  editable
}) => {

  const { checkIn, posts, terminals } = checkInItem;

  const arrivals = terminals.filter(terminal => terminal.type === 'arrival');
  const arrival = arrivals.length > 0 ? arrivals[0] : null;

  const departures = terminals.filter(terminal => terminal.type === 'departure');
  const departure = departures.length > 0 ? departures[0] : null;

  let content = null;
  let comments = null;

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

    comments = checkIn.comments;

  } else if (contentType === 'arrival' && arrival) {
    content = <Terminal terminal={arrival} />;
    comments = arrival.comments;
  } else if (contentType === 'departure' && departure) {
    content = <Terminal terminal={departure} />;
    comments = departure.comments;
  }

  const showHeader = content && content.length !== 0;

  const userName = checkIn.user ? (checkIn.user.username || (checkIn.user.firstName + ' ' + checkIn.user.lastName)) : 'Anonymoyus';
  const dateStr = (new Date(checkIn.date)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const commentsAttributes = {
    checkIn,
    frameId
  };

  if (contentType === 'departure') {
    commentsAttributes.terminal = departure;
  } else if (contentType === 'arrival') {
    commentsAttributes.terminal = arrival;
  }

  let deleteContentDialog = null;
  if ((frameId === true || frameId === 'frame-edit') && deleteCandidate && (deleteCandidate.type === 'post' || deleteCandidate.type === 'terminal')) {
    deleteContentDialog = <DeleteContentDialog />;
  }

  const userImageSrc = getImageUrl(checkIn.user.avatar || checkIn.user.avatarSource, checkIn.user.photo, env.MEDIA_URL);
  return (
    <div className={s.feedItemContent} id={`content-${frameId}`}>
      {
        showHeader &&
        <div className={s.contentHeader}>
          <div className={s.contentHeaderLeft}>
            {
              userImageSrc &&
                <Link to={`/?user=${checkIn.userUuid}`}>
                  <div className={s.userIcon}>
                    <img src={userImageSrc} />
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
                      setProperty('posts.deleteCandidate', {
                        type: 'post',
                        dialogText: <span>Delete post?</span>,
                        deleteItem: deletePost,
                        uuid: posts[activePost].uuid
                      });
                    } else if (contentType === 'arrival') {
                      setProperty('posts.deleteCandidate', {
                        type: 'terminal',
                        dialogText: <span>Delete arrival?</span>,
                        deleteItem: deleteTerminal,
                        uuid: arrival.uuid
                      });
                    } else if (contentType === 'departure') {
                      setProperty('posts.deleteCandidate', {
                        type: 'terminal',
                        dialogText: <span>Delete departure?</span>,
                        deleteItem: deleteTerminal,
                        uuid: departure.uuid
                      });
                    }
                  }}>delete</FontIcon>
                </div> :
                <div>
                  <div className={s.likes}>
                    <div className={s.heart}>
                      {
                        (sentLike && sentLike.checkInUuid === checkIn.uuid && sentLike.frameId === frameId) ?
                            <FontIcon className="material-icons" style={{ fontSize: '20px', color: 'gray' }}
                                      onClick={() => saveLike(checkIn.uuid, 'CheckIn', 'off', frameId, checkIn.uuid)}>
                              favorite
                            </FontIcon> : (
                            checkIn.likedByUser ?
                              <FontIcon className="material-icons" style={{ fontSize: '20px', color: 'red' }}
                                        onClick={() => saveLike(checkIn.uuid, 'CheckIn', 'off', frameId, checkIn.uuid)}>
                                favorite
                              </FontIcon> :
                              <FontIcon className="material-icons" style={{ fontSize: '20px' }}
                                        onClick={() => saveLike(checkIn.uuid, 'CheckIn', 'on', frameId, checkIn.uuid)}>
                                favorite_border
                              </FontIcon>
                          )
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
      {deleteContentDialog}
      {content}
      <div className={s.tags}>
        {
          showSettings ?
            (checkIn.tags || []).map(tag => (
              <div className={s.removableTag}>
                <div className={s.tagValue}>#{tag}</div>
                <div className={s.removeTag} onClick={() => {
                  saveCheckIn({ checkIn: { uuid: checkIn.uuid, tags: checkIn.tags.filter(t => t !== tag)}})
                }}>
                  <FontIcon className="material-icons" style={{ fontSize: '16px', color: '#9a0000' }}>
                    remove_circle_outline
                  </FontIcon>
                </div>
              </div>
            )) :
            (checkIn.trip ? [
              <div key={`${checkIn.uuid}-${checkIn.trip.name}`} className={s.trip}><Link to={`/?trip=${checkIn.trip.uuid}`}>{checkIn.trip.name}</Link></div>
            ] : []).concat((checkIn.tags || []).map(tag => (
              <div key={`${checkIn.uuid}-${tag}`} className={s.tag}>#<Link to={`/?tags=${tag}`}>{tag}</Link></div>
            )))
        }
      </div>
      {
        (frameId !== true && !showSettings) &&
          <div>
            <Comments comments={comments} frameId={frameId} preview={!editable} {...commentsAttributes} />
          </div>
      }
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
    sentLike: state.posts.sentLike,
    feedUpdated: state.posts.feedUpdated,
    commentText: state.posts.commentText,
    deleteCandidate: state.posts.deleteCandidate
  }), {
    setDeepProperty, setProperty, saveCheckIn, deletePost, deleteTerminal, saveLike, saveComment
  })(withStyles(s)(CheckInItemContent))
);
