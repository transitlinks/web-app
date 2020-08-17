import React from 'react';
import { connect } from 'react-redux';
import {
  saveComment
} from '../../actions/comments';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Comments.css';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Link from '../Link';
import { injectIntl, FormattedMessage } from 'react-intl';
import { formatDuration, truncate, getCookie } from '../utils';

const getCommentAuthor = (user) => {

  const { username, firstName, lastName, email } = user;
  if (username) {
    return user.username;
  } else if (firstName || lastName) {
    return [firstName, lastName].filter(name => name).join(' ');
  }

  return 'Anonymous';

};

const Comments = ({
  comments, checkIn, terminal, commentText, frameId, preview,
  setProperty, saveComment,
  auth, env, intl
}) => {

  return (
    <div className={s.comments}>
      {
        (auth && auth.loggedIn) &&
          <div className={s.commentInput}>
            <div className={s.icon}>
              <FontIcon className="material-icons" style={{ fontSize: '24px' }}>
                chat
              </FontIcon>
            </div>
            <div className={s.input}>
              <TextField id={`comment-input-${frameId}`}
                         value={commentText[frameId]}
                         fullWidth
                         hintText={!commentText ? 'Write comment...' : null}
                         onChange={(e) => {
                           setProperty('posts.commentText', { ...commentText, [frameId]: e.target.value });
                         }}
                         onKeyDown={(e) => {
                           if (e.keyCode === 13) {
                             console.log('save comment', commentText);
                             const newComment = { text: commentText[frameId] };
                             if (terminal) newComment.terminalUuid = terminal.uuid;
                             else if (checkIn) newComment.checkInUuid = checkIn.uuid;
                             saveComment(newComment, frameId);
                             setProperty('posts.commentText', { ...commentText, [frameId]: '' });
                           }
                         }}
              />
            </div>
          </div>
      }
      {
        (comments && comments.length > 0) &&
        (preview ? comments.slice(0, 1) : comments).map(comment => {
          return (
            <div className={s.comment}>
              <p className={s.commentContent}>
                <span className={s.commentAuthor}>
                  { getCommentAuthor(comment.user) }
                </span>
                { comment.text }
              </p>
            </div>
          );
        })
      }
      {
        (preview && comments && comments.length > 1) &&
          <div className={s.otherComments}>
            <Link to={`/check-in/${checkIn.uuid}`}>{ comments.length } comments</Link>
          </div>
      }
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    auth: state.auth.auth,
    env: state.env,
    commentText: state.posts.commentText || {}
  }), {
    saveComment,
    setProperty
  })(withStyles(s)(Comments))
);
