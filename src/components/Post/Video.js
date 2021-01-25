import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Post.css';

const Video = ({
  mediaItem
}) => {
  return (
    <div key={mediaItem.uuid} className={s.videoContainer}>
      {
        mediaItem.hosting === 'vimeo' ?
          <iframe src={`https://player.vimeo.com${mediaItem.url.replace('videos', 'video')}?badge=0&title=0&byline=0&portrait=0&amp;autopause=0&amp;player_id=0&amp;app_id=201568`}
                  width="100%" height="315" frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture" allowFullScreen
                  title="Untitled" /> :
          <iframe width="100%" height="315"
                  src={`https://www.youtube.com/embed/${mediaItem.url}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />

      }
    </div>
  );

};

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(Video))
);
