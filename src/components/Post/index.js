import React from 'react';
import cx from 'classnames';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Video from './Video';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Post.css';

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
                <div key={mediaItem.uuid} className={s.imgContainer}>
                  <img src={env.MEDIA_URL + mediaItem.url} />
                </div>
              );
            } else {
              return <Video mediaItem={mediaItem} />;
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


