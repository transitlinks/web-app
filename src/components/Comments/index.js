import React from 'react';
import { connect } from 'react-redux';
import { 
  saveComment,
  voteComment 
} from '../../actions/viewLinkInstance';
import { setProperty } from '../../actions/properties';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Comments.css';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { injectIntl, FormattedMessage } from 'react-intl';
import { formatDuration, truncate, getCookie } from '../utils';
import CommentInput from './CommentInput';
 
const Comments = ({
  user,
  comments, savedComment,
  setProperty, saveComment, voteComment,
  newCommentText, commentVote, replyTo,
  env, intl,
  linkInstance
}) => {

  const formatCommentText = (text) => {
    return text.replace(/\n/g, '<br/>'); 
  };

  const submitCommentVote = (commentUuid, value) => {
    voteComment({ uuid: commentUuid, value });
    document.cookie = `txlinks-comment-vote-${commentUuid}=${value}`;
  };

  const getLikeStyle = (commentUuid, value) => {
    
    if (!canUseDOM) return null;
    
    const cookie = getCookie(`txlinks-comment-vote-${commentUuid}`);
    if (!cookie) {
      return { cursor: 'pointer', fontSize: '18px' };
    }
    
    if (parseInt(cookie) === value) {
      return { color: '#0074c2', fontSize: '18px' };
    } else {
      return { color: '#c0c0c0', fontSize: '18px' };
    }
  
  };
  
  const openReplyInput = (comment) => {
    setProperty('replyToText', '');
    setProperty('replyTo', comment);
  };
  
  const commentByUuid = {};
  (comments || []).forEach(comment => {
    commentByUuid[comment.uuid] = comment;
    commentByUuid[comment.uuid].replys = [];
  });
  
  const replyUuids = []; 
  Object.keys(commentByUuid).forEach(commentUuid => {
    const comment = commentByUuid[commentUuid];
    if (comment.replyToUuid) {
      commentByUuid[comment.replyToUuid].replys.push(comment);
      replyUuids.push(commentUuid);
    }
  });
  
  replyUuids.forEach(replyUuid => { delete commentByUuid[replyUuid]; });

  console.log("ordered comments", commentByUuid); 
  const renderComment = (comment) => {
    
    if (commentVote && commentVote.uuid === comment.uuid) {
      comment.up = commentVote.up;
      comment.down = commentVote.down;
    }
    
    const secondLevel = comment.replyToUuid && commentByUuid[comment.replyToUuid];
    
    return (
      <div className={cx(s.comment, secondLevel ? s.reply : null)}>
        <div className={s.commentText}>
          <span className={s.username}>
            {comment.username || 'Anonymous'}&gt;
          </span>
          <span className={s.text}
            dangerouslySetInnerHTML={ { __html: formatCommentText(comment.text) } }>
          </span>
        </div>
        <div className={s.commentControls}>
          <div className={s.commentReply}>
            { 
              (!replyTo || replyTo.uuid !== comment.uuid) &&
              <span onClick={() => openReplyInput(comment)}>
                Reply
              </span>
            }
            { 
              (replyTo && replyTo.uuid === comment.uuid) &&
              <span onClick={() => setProperty('replyTo', null)}>
                Cancel reply
              </span>
            }
          </div>
          <div className={s.commentLikes}>
            <div className={s.likeBlock}>
              <span>{comment.up}</span>
              <FontIcon className="material-icons" 
                onClick={() => submitCommentVote(comment.uuid, 1)}
                style={getLikeStyle(comment.uuid, 1)}>
                add
              </FontIcon>
            </div>
            <div className={s.likeBlock}>
              <span>{comment.down}</span>
              <FontIcon className="material-icons" 
                onClick={() => submitCommentVote(comment.uuid, -1)}
                style={getLikeStyle(comment.uuid, -1)}>
                remove
              </FontIcon>
            </div>
          </div>
        </div>
        { 
          (replyTo && replyTo.uuid === comment.uuid) &&
          <div>
            <CommentInput linkInstance={linkInstance} 
              replyTo={comment} />
          </div>
        }
        {comment.replys.map(reply => renderComment(reply))}
      </div>
    );
  
  };
 
  const commentElems = (Object.keys(commentByUuid)).map(commentUuid => { 
    const comment = commentByUuid[commentUuid];
    return renderComment(comment);
  });
 
  return (
    <div className={s.container}>
      <div className={s.comments}>
        <CommentInput linkInstance={linkInstance}/>
        <div className={s.commentsList}>
          {commentElems}
        </div>
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    user: state.auth.auth.user,
    env: state.env,
    newCommentText: state.viewLinkInstance.newCommentText,
    replyTo: state.viewLinkInstance.replyTo,
    commentVote: state.viewLinkInstance.commentVote
  }), {
    saveComment,
    voteComment,
    setProperty
  })(withStyles(s)(Comments))
);
