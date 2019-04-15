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

  if (contentType === 'reaction') {

    content = posts.map(post => {
      return <Post post={post}/>;
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


