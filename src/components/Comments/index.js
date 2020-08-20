import React from 'react';
import { connect } from 'react-redux';
import {
  deleteComment,
  saveComment,
  saveLike,
} from '../../actions/comments';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Comments.css';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Link from '../Link';
import { injectIntl } from 'react-intl';

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
  comments, checkIn, terminal, commentText, frameId, preview, commentReplyTo,
  setProperty, saveComment, deleteComment, saveLike,
  auth, env, intl
}) => {

  const addReplys = (subComments, sortedComments) => {
    subComments.forEach(subComment => {
      if (subComment.replyToUuid) sortedComments.push(subComment);
      const replys = comments.filter(reply => reply.replyToUuid === subComment.uuid);
      addReplys(replys, sortedComments);
    });
    return sortedComments;
  };

  const sortedComments = [];
  (comments || []).forEach(comment => {
    if (!comment.replyToUuid) {
      sortedComments.push(comment);
      sortedComments.push(...addReplys([comment], []));
    }
  });

  const getCommentInput = (comment) => {

    const commentInput = (
      <div className={s.commentInput}>
        {
          comment ?
            (
              !comments.find(c => c.uuid === comment.replyToUuid) ?
                <div className={s.replyToIndicator}></div> : null
            ) :
            <div className={s.icon}>
              <FontIcon className="material-icons" style={{ fontSize: '24px' }}>
                chat
              </FontIcon>
            </div>
        }
        <div className={s.input}>
          <TextField id={`comment-input-${frameId}`}
                     value={commentText[frameId]}
                     fullWidth
                     hintText={!commentText[frameId] ? (commentReplyTo ? 'Reply...' : 'Comment...') : null}
                     onChange={(e) => {
                       setProperty('posts.commentText', { ...commentText, [frameId]: e.target.value });
                     }}
                     onKeyDown={(e) => {
                       if (e.keyCode === 13) {
                         const newComment = { text: commentText[frameId] };
                         if (terminal) newComment.terminalUuid = terminal.uuid;
                         else if (checkIn) newComment.checkInUuid = checkIn.uuid;
                         if (commentReplyTo) newComment.replyToUuid = commentReplyTo;
                         saveComment(newComment, frameId);
                         setProperty('posts.commentText', { ...commentText, [frameId]: '' });
                       }
                     }}
          />
        </div>
      </div>
    );

    return commentInput;

  };


  return (
    <div className={s.comments}>
      {
        (auth && auth.loggedIn && !commentReplyTo) &&
          (getCommentInput())
      }
      {
        (comments && comments.length > 0) &&
        (preview ? sortedComments.slice(0, 1) : sortedComments).map(comment => {
          return (
            <div className={s.comment}>
              {
                comment.replyToUuid &&
                  <div className={s.replyIndent}>
                  </div>
              }
              <div className={s.commentBody}>
                <p className={s.commentContent}>
                  <span className={s.commentAuthor}>
                    { getCommentAuthor(comment.user) }
                  </span>
                  { comment.text }
                </p>
                <div className={s.commentControlsBorder}></div>
                {
                  (commentReplyTo === comment.uuid) &&
                    (getCommentInput(comment))
                }
                <div className={s.commentControls} style={ comment.replyToUuid ? { marginRight: '6px' } : {} }>
                  <div className={s.left}>
                    {
                      (auth && auth.loggedIn && comment.user.uuid === auth.user.uuid) && (
                        <div className={s.delete} onClick={() => deleteComment(comment.uuid, frameId, checkIn.uuid)}>
                          Delete
                        </div>
                      )
                    }
                  </div>
                  <div className={s.right}>
                    {
                      (auth && auth.loggedIn) && (
                        (commentReplyTo === comment.uuid) ?
                          <div className={s.reply} onClick={() => setProperty('posts.commentReplyTo', null)}>
                            Cancel
                          </div> :
                          <div className={s.reply} onClick={() => setProperty('posts.commentReplyTo', comment.uuid)}>
                            Reply
                          </div>

                      )
                    }
                    {
                      comment.likedByUser ?
                        <div className={s.commentLikes} onClick={() => saveLike(comment.uuid, 'Comment', 'off', frameId, checkIn.uuid)}>
                          <div className={s.icon}>
                            <FontIcon className="material-icons" style={{ fontSize: '16px' }}>
                              favorite
                            </FontIcon>
                          </div>
                          <div className={s.count}>
                            { comment.likes || 0 }
                          </div>
                        </div> :
                        <div className={s.commentLikes} onClick={() => saveLike(comment.uuid, 'Comment', 'on', frameId, checkIn.uuid)}>
                          <div className={s.icon}>
                            <FontIcon className="material-icons" style={{ fontSize: '16px' }}>
                              favorite_border
                            </FontIcon>
                          </div>
                          <div className={s.count}>
                            { comment.likes || 0 }
                          </div>
                        </div>

                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })
      }
      {
        (preview && comments && comments.length > 1) &&
          <div className={s.otherComments}>
            <Link to={`/check-in/${checkIn.uuid}?view=${terminal ? terminal.type : 'reaction'}`}>{ comments.length } comments</Link>
          </div>
      }
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    auth: state.auth.auth,
    env: state.env,
    commentText: state.posts.commentText || {},
    commentReplyTo: state.posts.commentReplyTo
  }), {
    saveComment,
    deleteComment,
    setProperty,
    saveLike
  })(withStyles(s)(Comments))
);
