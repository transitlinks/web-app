import React from 'react';
import cx from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas, getDateString, getTimeString } from '../utils';
import Terminal from '../Terminal';
import s from './FeedItemContent.css';
import FontIcon from 'material-ui/FontIcon';
import { setProperty } from "../../actions/properties";
import { getFeedItem } from "../../actions/posts";

import terminalMsg from '../Add/messages.terminal';

const FeedItemContent = ({
  feedItem, contentType, env
}) => {

  const { checkIn, posts, terminals } = feedItem;
  let content = null;

  console.log('feedItem', feedItem);

  const formatDate = (date) => {

    if (date) {
      return (new Date(date)).toDateString().substring(4);
    }

    return '-';

  };

  console.log("feeditem content", posts, contentType);

  const renderFeedItemHeader = (name) => {

    return (
      <div className={s.feedItemHeader}>
        <div className={s.feedItemInfo}>
          <div className={s.feedItemAuthor}>{name}</div>
          <div className={s.feedItemDate}>Feb 4 at 23:11</div>
        </div>
        <div className={s.feedItemControls}>
          <div className={s.feedItemPrev}>
            &lt;
          </div>
          <div className={s.feedItemOptions}>
            x
          </div>
          <div className={s.feedItemNext}>
            &gt;
          </div>
        </div>
      </div>
    );

  };

  if (contentType === 'reaction') {

    content = posts.map(post => {

      const name = post.user || 'Anonymous';

      return (
        <div className={s.post}>
          { renderFeedItemHeader(name) }
          <div className={s.mediaContent}>
            {
              (post.mediaItems || []).map(mediaItem => {
                return (
                  <div>
                    <img src={env.MEDIA_URL + mediaItem.url} width="100%"/>
                  </div>
                );
              })
            }
          </div>
          <div className={s.postText}>{post.text}</div>
          <div className={s.postControls}></div>
        </div>
      );
    });

  } else if (contentType === 'arrival') {

    content = terminals.filter(terminal => terminal.type === 'arrival').map(terminal => {
      return <Terminal terminal={terminal} />;
    });

  } else if (contentType === 'departure') {

    content = terminals.filter(terminal => terminal.type === 'departure').map(terminal => {
      return <Terminal terminal={terminal} />;
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
    env: state.env
  }), {
  })(withStyles(s)(FeedItemContent))
);


