import React from 'react';
import cx from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas, getDateString, getTimeString } from '../utils';
import Post from '../Post';
import Terminal from '../Terminal';
import s from './FeedItemContent.css';
import FontIcon from 'material-ui/FontIcon';
import { setDeepProperty, setProperty } from "../../actions/properties";
import { getFeedItem } from "../../actions/posts";

import terminalMsg from '../Add/messages.terminal';
import Link from "../Header";

const FeedItemContent = ({
  feedItem, contentType, feedProperties, frameId, env,
  setDeepProperty, setProperty
}) => {

  const { checkIn, posts, terminals } = feedItem;
  let content = null;

  const formatDate = (date) => {

    if (date) {
      return (new Date(date)).toDateString().substring(4);
    }

    return '-';

  };


  const scrollToPost = (postIndex) => {
    setDeepProperty('posts', ['feedProperties', frameId, 'activePost'], postIndex);
  };

  if (posts.length > 0 && contentType === 'reaction') {

    let activePost = ((feedProperties && feedProperties[frameId]) && feedProperties[frameId]['activePost']) || 0;
    if (activePost > posts.length - 1) {
      console.log("post out of bounds", feedProperties, activePost, frameId, posts);
      activePost = 0;
    }

    if (posts.length > 0) {

      const indicatorDots = [];
      if (posts.length > 1) {
        for (let i = 0; i < posts.length; i++) {
          indicatorDots.push(
            <div className={cx(s.indicatorDot, i === activePost ? s.selectedIndicatorDot : {})}>
            </div>
          );
        }
      }

      content = (
        <div className={s.posts}>
          <Post post={posts[activePost || 0]}/>
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

      content = (
        <div></div>
      );

    }

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

  const userName = checkIn.user || 'Anonymoyus';
  const dateStr = (new Date(checkIn.date)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className={s.feedItemContent} id={`content-${frameId}`}>
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
        </div>
      </div>
      {content}
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    env: state.env,
    feedProperties: state.posts.feedProperties || {}
  }), {
    setDeepProperty, setProperty
  })(withStyles(s)(FeedItemContent))
);
