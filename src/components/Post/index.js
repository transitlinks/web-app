import React from 'react';
import cx from 'classnames';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas, getDateString, getTimeString } from '../utils';
import Terminal from '../Terminal';
import s from './Post.css';
import FontIcon from 'material-ui/FontIcon';
import { setProperty } from "../../actions/properties";
import { getFeedItem } from "../../actions/posts";

import terminalMsg from '../EditCheckInItem/messages.terminal';

const Post = ({
  post, header, env
}) => {

  const name = post.user || 'Anonymous';;

  const textOnly = (post.mediaItems || []).length === 0;

  return (
    <div className={cx(s.post, textOnly ? s.textOnlyPost : {})}>
      { header }
      <div className={s.mediaContent}>
        {
          (post.mediaItems || []).map(mediaItem => {
            if (mediaItem.type === 'image') {
              return (
                <div className={s.imgContainer}>
                  <img src={env.MEDIA_URL + mediaItem.url} />
                </div>
              );
            } else {
              return (
                <div className={s.videoContainer}>
                  <iframe width="100%" height="315"
                          src={`https://www.youtube.com/embed/${mediaItem.url}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen></iframe>
                </div>
              );
            }
          })
        }
      </div>
      <div className={!textOnly ? s.postMediaText : s.postText}>{post.text}</div>
      <div className={s.postControls}></div>
    </div>
  );

};

export default injectIntl(
  connect(state => ({
    env: state.env
  }), {
  })(withStyles(s)(Post))
);


