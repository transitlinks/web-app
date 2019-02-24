import React from 'react';
import cx from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas } from '../utils';
import s from './FeedItemContent.css';
import FontIcon from 'material-ui/FontIcon';
import { setProperty } from "../../actions/properties";
import { getFeedItem } from "../../actions/posts";

import terminalMsg from '../Add/messages.terminal';

const FeedItemContent = ({
  feedItem, contentType
}) => {

  const { checkIn, posts, terminals } = feedItem;
  let content = null;

  const formatDate = (date) => {

    console.log("format date", date);
    if (date) {
      return (new Date(date)).toDateString().substring(4);
    }

    return '-';

  };

  if (contentType === 'reaction') {

    content = posts.map(post => {
      return (
        <div className={s.post}>
          <div className={s.postInfo}>
            <div className={s.postAuthor}>Anonymous</div>
            <div className={s.postDate}>Feb 4 at 23:11</div>
          </div>
          <div className={s.postText}>{post.text}</div>
          <div className={s.postControls}></div>
        </div>
      );
    });

  } else if (contentType === 'arrival') {

    content = terminals.filter(terminal => terminal.type === 'arrival').map(terminal => {
      return (
        <div className={s.terminalContainer}>
          <div className={s.terminal}>
            <div className={s.transport}>
              <FormattedMessage {...terminalMsg[terminal.transport]} />
            </div>
            <div className={s.terminalFrom}>
              from Helsinki
            </div>
          </div>
          <div className={s.transportId}>
            {terminal.transportId}
          </div>
        </div>
      );
    });

  } else if (contentType === 'departure') {

    content = terminals.filter(terminal => terminal.type === 'departure').map(terminal => {
      return (
        <div className={s.terminal}>
          --{terminal.type}
        </div>
      );
    });

  } else if (contentType === 'lodging') {

  }

  return (
    <div className={s.feedItemContent}>
      {content}
    </div>
  );


};

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(FeedItemContent))
);
