import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Add.css';
import Terminal from './Terminal';
import FeedItemContent from '../FeedItemContent';
import { getGeolocation } from '../../actions/global';
import { savePost, saveCheckIn, uploadFiles, getMediaItem } from '../../actions/posts';
import { setProperty } from '../../actions/properties';
import { getClientId } from '../../core/utils';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const formatCoords = (coords) => {
  const { latitude, longitude } = coords;
  return `${latitude}`.substring(0, 6) + '/' + `${longitude}`.substring(0, 6);
};

const typeSelector = (iconName, isSelected, onClick) => {
  return (
    <div className={cx(s.contentTypeSelector, isSelected ? s.typeSelected : {})} onClick={() => onClick()}>
      <div>
        <FontIcon className="material-icons" style={{ fontSize: '20px' }}>{iconName}</FontIcon>
      </div>
    </div>
  );
};

const createCheckIn = (geolocation) => {

  const { position } = geolocation;
  const clientId = getClientId();

  if (position) {
    const { coords: { latitude, longitude } } = position;
    return { latitude, longitude, clientId };
  }

  return null;

};

const createPost = (props) =>  {

  const { postText, feedItem: { checkIn }, mediaItems } = props;
  const clientId = getClientId();

  (mediaItems || []).forEach(mediaItem => {
    if (!mediaItem.thumbnail) delete mediaItem.thumbnail;
  });

  return {
    post: {
      text: postText,
      mediaItems,
      checkInUuid: checkIn.uuid,
      clientId
    }
  };

}


const getTabContent = (type, props) => {

  const {
    feedItem: { checkIn }, transportTypes, openTerminals, postText, mediaItems, env,
    savePost, uploadFiles, getMediaItem, setProperty, uploadingMedia, loadedMediaItemChanged, loadMediaItem, loadMediaItemError
  } = props;

  const onFileInputChange = (event) => {
    uploadFiles({
      entityType: 'CheckIn',
      entityUuid: checkIn.uuid
    }, event.target.files);
  };

  console.log('loadMediaItem', loadMediaItem);
  if (loadedMediaItemChanged && loadMediaItem) {
    setProperty('posts.loadedMediaItemChanged', false);
    setTimeout(() => {
      getMediaItem(loadMediaItem.uuid);
    }, 1000);
  }

  switch (type) {

    case 'reaction':

      console.log("MEDIA ITEMS", mediaItems, loadMediaItem);

      return (
        <div className={s.contentEditor}>
          <div className={s.mediaContent}>
            {
              loadMediaItem &&
                <div>Uploading media, please wait... {loadMediaItem.uploadProgress}</div>
            }
            {
              (mediaItems || []).map(mediaItem => {
                return (
                  <div>
                    {
                      mediaItem.type === 'image' ?
                        <img src={env.MEDIA_URL + mediaItem.url} width="100%" /> :
                        <img src={mediaItem.thumbnail} width="100%"/>

                    }
                  </div>
                );
              })
            }
          </div>
          <div className={s.contentHorizontal}>
            <div className={s.commentContainer}>
              <TextField id="post-text"
                         value={postText}
                         multiLine={true}
                         fullWidth={true}
                         rows={2}
                         onChange={(e) => setProperty('posts.postText', e.target.value)}
                         hintText={(!postText) ? "What's up?" : null}
                         hintStyle={{ bottom: '36px'}}
              />
            </div>
          </div>
          <div className={s.contentControls}>
            <div className={s.addMediaContainer}>
              <div className={s.addMediaButton}>
                <input type="file" name="file" id="file" onChange={onFileInputChange} className={s.fileInput} />
                <label htmlFor="file">
                  <FontIcon className="material-icons">add_a_photo</FontIcon>
                </label>
              </div>
            </div>
            <div className={s.sendButton}>
              <FontIcon className="material-icons" onClick={() => savePost(createPost(props))}>send</FontIcon>
            </div>
          </div>
        </div>
      );

    case 'arrival':
      return (
        <div className={s.contentEditor}>
          <Terminal transportTypes={transportTypes} openTerminals={openTerminals} checkIn={checkIn} type="arrival" terminal={{ type: 'arrival '}} />
        </div>
      );
    case 'departure':
      return (
        <div className={s.contentEditor}>
          <Terminal transportTypes={transportTypes} openTerminals={openTerminals} checkIn={checkIn} type="departure" terminal={{ type: 'departure '}} />
        </div>
      );
    case 'lodging':
      return (
        <div className={s.contentEditor}>
          Lodging
        </div>
      );
    case 'poi':
      return (
        <div className={s.contentEditor}>
          Point of interest
        </div>
      );
    case 'activity':
      return (
        <div className={s.contentEditor}>
          Activity
        </div>
      );

  }
};


const AddView = (props) => {

  const {
    type, transportTypes, feedItem, openTerminals, intl, geolocation, postText, mediaItems,
    setProperty, getGeolocation, savePost, saveCheckIn, uploadingMedia
  } = props;

  console.log("add props", props);

  let positionElem = null;
  if (geolocation) {
    if (geolocation.status === 'located') {
      const { position } = geolocation;
      positionElem = feedItem.checkIn.formattedAddress;
    } else if (geolocation.status === 'locating') {
      positionElem = (
        <div>
          Locating...
        </div>
      );
    } else if (geolocation.status === 'error') {
      positionElem = (
        <div>
          { geolocation.error }
        </div>
      );
    }
  }

  const { checkIn } = feedItem;

  let defaultType = 'reaction';
  if (openTerminals && openTerminals.length > 0) {
    const openArrivals = openTerminals.filter(terminal => (terminal.type === 'arrival' && terminal.checkIn.uuid !== checkIn.uuid));
    const openDepartures = openTerminals.filter(terminal => (terminal.type === 'departure' && terminal.checkIn.uuid !== checkIn.uuid));
    if (openArrivals.length > 0) {
      defaultType = 'departure';
    } else if (openDepartures.length > 0) {
      defaultType = 'arrival';
    }

    console.log("debug", openArrivals, openDepartures, defaultType);

  }

  const selectedType = type || defaultType;
  console.log("adding....", geolocation);

	return (
	  <div className={s.root}>
      <div className={s.container}>
        <div className={s.placeSelector}>
          <div className={s.positionContainer}>
            <div className={s.positionSelector}>
              <div className={s.editPositionButton} onClick={() => {
                saveCheckIn({ checkIn: createCheckIn(geolocation) });
              }}>

              </div>
              <div className={s.positionValue}>
                { positionElem }
              </div>
            </div>
          </div>
        </div>
        <div className={s.postContent}>
          <div className={s.contentTypeContainer}>
            <div className={s.contentTypeSelectors}>
              { typeSelector('tag_faces', selectedType === 'reaction', () => setProperty('posts.addType', 'reaction')) }
              { typeSelector('call_made', selectedType === 'departure', () => setProperty('posts.addType', 'departure')) }
              { typeSelector('call_received', selectedType === 'arrival', () => setProperty('posts.addType', 'arrival')) }
              { typeSelector('hotel', selectedType === 'lodging', () => setProperty('posts.addType', 'lodging')) }
            </div>
          </div>
          { getTabContent(selectedType, props) }
        </div>
      </div>
      <FeedItemContent transportTypes={transportTypes} feedItem={feedItem} contentType={selectedType} frameId={'frame-add'} />
    </div>
  );

};

AddView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    geolocation: {
      status: state.global['geolocation.status'],
      position: state.global['geolocation.position'],
      error: state.global['geolocation.error']
    },
    postText: state.posts.postText,
    savedPost: state.posts.post,
    savedCheckIn: state.posts.checkIn,
    type: state.posts.addType,
    mediaItems: state.posts.mediaItems,
    uploadingMedia: state.posts.uploadingMedia,
    loadMediaItem: state.posts.loadMediaItem,
    loadMediaItemError: state.posts.loadMediaItemError,
    loadedMediaItemChanged: state.posts.loadedMediaItemChanged,
    env: state.env
  }), {
    setProperty,
    getGeolocation,
    savePost,
    uploadFiles,
    saveCheckIn,
    getMediaItem
  })(withStyles(s)(AddView))
);
