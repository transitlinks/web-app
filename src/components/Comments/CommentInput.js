import React from 'react';
import { connect } from 'react-redux';
import { 
  saveComment
} from '../../actions/viewLinkInstance';
import { setProperty } from '../../actions/properties';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Comments.css';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { injectIntl, FormattedMessage } from 'react-intl';
import { formatDuration, truncate } from '../utils';

const CommentInput = ({
  setProperty, saveComment, linkInstance, replyTo,
  newCommentText, replyText,
  textFieldOptions,
  env, intl
}) => {
   
  const handleTextChange = (event) => {
    setProperty((replyTo ? 'replyText' : 'newCommentText'), event.target.value);
  };
  
  const submitNewComment = () => {

    saveComment({ 
      linkInstanceUuid: linkInstance.uuid,
      text: newCommentText 
    });

    setProperty('newCommentText', '');

  };
  
  const submitNewReply = () => {

    saveComment({ 
      linkInstanceUuid: linkInstance.uuid,
      replyToUuid: replyTo.uuid,
      text: replyText
    });

    setProperty('replyText', '');
    setProperty('replyTo', null);

  };
  
  const textFieldAttributes = replyTo ? {
    hintText: "What's your response?",
    rows: 1
  } : {
    hintText: "What do you have in mind?",
    floatingLabelText: "Post a comment",
    hintStyle: { bottom: '36px' },
    floatingLabelStyle: { color: '#000000', fontSize: '24px' },
    floatingLabelFocusStyle: { fontSize: '24px', top: '28px' },
    rows: 2
  };
 
  return (
    <div className={s.newComment}>
      <div className={s.newCommentInput}>
        <div className={s.newCommentInputTitle}>
        </div>
        <div className={s.commentInput}>
          <TextField id={(replyTo ? "reply-comment-input" : "new-comment-input")}
            {...textFieldAttributes}
            value={(replyTo ? replyText : newCommentText) || ''}
            multiLine={true}
            fullWidth={true}
            onChange={handleTextChange}
          />
        </div>
      </div>
      <div className={s.newCommentSubmit}>
        <FlatButton id="submit-new-comment" 
          onClick={() => replyTo ? submitNewReply() : submitNewComment()}>
          Send
        </FlatButton>
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    newCommentText: state.viewLinkInstance.newCommentText,
    replyText: state.viewLinkInstance.replyText
  }), {
    saveComment,
    setProperty
  })(withStyles(s)(CommentInput))
);
