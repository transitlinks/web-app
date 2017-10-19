import React from 'react';
import { connect } from 'react-redux';
import { 
  saveComment
} from '../../actions/viewLinkInstance';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Comments.css';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';
import { orange600, green600 } from 'material-ui/styles/colors';
import { injectIntl, FormattedMessage } from 'react-intl';
import { formatDuration, truncate } from '../utils';
import Link from '../Link';
 
const Comments = ({
  user,
  comments, savedComment,
  setProperty, saveComment,
  newCommentText,
  env, intl,
  linkInstance
}) => {

  const modeBackgrounds = {
    'research': orange600,
    'experience': green600
  };
   
  const handleNewCommentTextChange = (event) => {
    setProperty('newCommentText', event.target.value);
  };
  
  const formatCommentText = (text) => {
    return text.replace(/\n/g, '<br/>'); 
  };
 
  const submitNewComment = () => {
    saveComment({ 
      linkInstanceUuid: linkInstance.uuid,
      text: newCommentText 
    });
    setProperty('newCommentText', '');
  };
  
  const commentElems = (comments || []).map(comment => {
    return (
      <div className={s.comment}>
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
            <span>Reply</span>
          </div>
          <div className={s.commentLikes}>
            <span>+</span>
            <span>-</span>
          </div>
        </div>
      </div>
    );
  });
 
  return (
    <div className={s.container}>
      <div className={s.comments}>
        <div className={s.newComment}>
          <div className={s.newCommentInput}>
            <div className={s.newCommentInputTitle}>
            </div>
            <div className={s.commentInput}>
              <TextField id="new-comment-input"
                value={newCommentText || ''}
                hintText="What do you have in mind?"
                floatingLabelText="Post a comment"
                hintStyle={ { bottom: '36px' } }
                floatingLabelStyle={ { color: '#000000', fontSize: '24px' } }
                floatingLabelFocusStyle={ { fontSize: '24px', top: '28px' } }
                multiLine={true}
                fullWidth={true}
                rows={2}
                onChange={handleNewCommentTextChange}
              />
            </div>
          </div>
          <div className={s.newCommentSubmit}>
            <FlatButton id="submit-new-comment" 
              onClick={() => submitNewComment()}>
              Send
            </FlatButton>
          </div>
        </div>
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
  }), {
    saveComment,
    setProperty
  })(withStyles(s)(Comments))
);
