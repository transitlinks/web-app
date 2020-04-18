import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './EditCheckInItem.css';
import Terminal from './Terminal';
import CheckInItemContent from '../CheckInItemContent';
import { getGeolocation } from '../../actions/global';
import { savePost, saveCheckIn, deleteCheckIn, uploadFiles, getMediaItem } from '../../actions/posts';
import { setProperty } from '../../actions/properties';
import { getClientId } from '../../core/utils';
import { injectIntl } from 'react-intl';
import Link from '../Link';

const typeSelector = (iconName, isSelected, onClick) => {
  return (
    <div className={cx(s.contentTypeSelector, isSelected ? s.typeSelected : {})} onClick={() => {
      setProperty('editTerminal.terminal', {});
      setProperty('posts.editPost', {});
      onClick();
    }}>
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

  const { editPost, checkInItem: { checkIn }, mediaItems, tags } = props;
  const clientId = getClientId();

  (mediaItems || []).forEach(mediaItem => {
    if (!mediaItem.thumbnail) delete mediaItem.thumbnail;
  });

  return {
    post: {
      uuid: editPost.uuid,
      text: editPost.text,
      mediaItems,
      checkInUuid: checkIn.uuid,
      clientId,
      tags
    }
  };

}


const getTabContent = (type, props) => {

  const {
    checkInItem: { checkIn, inbound }, transportTypes, openTerminals, postText, mediaItems, env, editTerminal, editPost,
    savePost, uploadFiles, getMediaItem, setProperty, uploadingMedia,
    loadedMediaItemChanged, loadMediaItem, loadMediaItemError, disabledTags, newCheckIn, savedTerminal
  } = props;

  const onFileInputChange = (event) => {
    uploadFiles({
      entityType: 'CheckIn',
      entityUuid: checkIn.uuid
    }, event.target.files);
  };

  if (loadMediaItem && loadedMediaItemChanged > -1) {
    const loadTimeout = loadedMediaItemChanged === 1 ? 1000 : 10000;
    setProperty('posts.loadedMediaItemChanged', -1);
    setTimeout(() => {
      getMediaItem(loadMediaItem.uuid);
    }, loadTimeout);
  }

  const terminal = (editTerminal && editTerminal.type === type) ? editTerminal : { type };

  const findTags = (text) => {

    const allTags = [];

    if (text) {
      let match;
      const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
      while ((match = regex.exec(text))) {
        console.log('match', match);
        allTags.push(match[1]);
      }
    }

    console.log('TAGS', checkIn);
    const inboundTags = (inbound && inbound.length > 0) ? inbound[0].tags : [];
    const distinct = (value, index, self) => self.indexOf(value) === index;
    return allTags.concat(inboundTags).filter(distinct).filter(tag => tag && tag.length > 0);

  };

  const tagEnabled = (tag) => !disabledTags.includes(tag);

  const tags = findTags(editPost.text);

  switch (type) {

    case 'reaction':

      return (
        <div className={s.contentEditor}>
          <div className={s.mediaContent}>
            {
              loadMediaItem &&
                <div className={s.uploadingVideo}>
                  Uploading media, please wait... {loadMediaItem.uploadProgress || 0}%
                </div>
            }
            {
              loadMediaItemError &&
              <div className={s.uploadingVideo}>
                Upload error :( &nbsp;
                <a onClick={() => setProperty('posts.loadMediaItemError', null)}>
                  OK
                </a>
              </div>
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
                         value={editPost.text || ''}
                         multiLine
                         fullWidth
                         rows={2}
                         onChange={(e) => {
                           setProperty('posts.editPost', { ...editPost, text: e.target.value });
                         }}
                         hintText={!editPost.text ? "What's up?" : null}
                         hintStyle={{ bottom: '36px'}}
              />
            </div>
          </div>
          <div className={s.tags}>
            {
              tags.map(tag => (
                <div className={cx(s.tag, tagEnabled(tag) ? s.enabledTag : s.disabledTag)}>
                  <div className={s.tagValue}>#{tag}</div>
                  {
                    tagEnabled(tag) ?
                      <div className={s.toggleTag} onClick={() => {
                        setProperty('posts.disabledTags', disabledTags.concat([tag]));
                      }}>
                        <FontIcon className="material-icons" style={{ fontSize: '16px', color: 'white' }}>
                          remove_circle_outline
                        </FontIcon>
                      </div> :
                      <div className={s.toggleTag} onClick={() => {
                        setProperty('posts.disabledTags', disabledTags.filter(disabledTag => disabledTag !== tag));
                      }}>
                        <FontIcon className="material-icons" style={{ fontSize: '16px', color: 'black' }}>
                          add_circle
                        </FontIcon>
                      </div>
                  }

                </div>
              ))
            }
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
              <FontIcon className="material-icons" onClick={() => savePost(
                createPost({
                  ...props,
                  tags: tags.filter(tag => tagEnabled(tag))
                })
              )}>send</FontIcon>
            </div>
          </div>
        </div>
      );

    case 'arrival':
      return (
        <div className={s.contentEditor}>
          <Terminal transportTypes={transportTypes} openTerminals={openTerminals} checkIn={checkIn} type="arrival" terminal={terminal} />
        </div>
      );
    case 'departure':
      return (
        <div className={s.contentEditor}>
          <Terminal transportTypes={transportTypes} openTerminals={openTerminals} checkIn={checkIn} type="departure" terminal={terminal} />
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


const EditCheckInItemView = (props) => {

  const {
    type, transportTypes, checkInItem, openTerminals, intl, geolocation, editTerminal, editPost, addPost, postText, mediaItems,
    setProperty, getGeolocation, savePost, saveCheckIn, deleteCheckIn, uploadingMedia, newCheckIn, savedTerminal, frameId, disabledTags
  } = props;

  let positionElem = null;
  if (geolocation) {
    if (geolocation.status === 'located') {
      const { position } = geolocation;
      positionElem = checkInItem.checkIn.formattedAddress;
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
    } else if (checkInItem.checkIn.formattedAddress) {
      positionElem = checkInItem.checkIn.formattedAddress;
    }
  }

  const { checkIn } = checkInItem;

  let defaultType = 'reaction';
  if (!editPost.uuid && openTerminals && openTerminals.length > 0) {
    const openArrivals = openTerminals.filter(terminal => (terminal.type === 'arrival' && terminal.checkIn.uuid !== checkIn.uuid));
    const openDepartures = openTerminals.filter(terminal => (terminal.type === 'departure' && terminal.checkIn.uuid !== checkIn.uuid));
    if (openArrivals.length > 0) {
      defaultType = 'departure';
    } else if (openDepartures.length > 0) {
      defaultType = 'arrival';
    }
  }

  const selectedType = type || defaultType;

  const departures = checkInItem.terminals.filter(terminal => terminal.type === 'departure');
  const arrivals = checkInItem.terminals.filter(terminal => terminal.type === 'arrival');

  const showSavedTerminal = (
    (departures.length > 0 && selectedType === 'departure') ||
    (arrivals.length > 0 && selectedType === 'arrival')
  ) && !editTerminal.uuid;
  const showContent = (!editTerminal.uuid && selectedType !== 'reaction') ||
    (!editPost.uuid && selectedType === 'reaction') || showSavedTerminal;
  const showEditor = !showSavedTerminal;

  return (
	  <div className={s.root}>
      <div className={s.container}>
        <div className={s.placeSelector}>
          <div className={s.positionContainer}>
            <div className={s.positionSelector}>
              <div className={s.editControls}>
                {
                  newCheckIn ?
                    <FontIcon className="material-icons" style={{ fontSize: '20px ' }} onClick={() => {
                      deleteCheckIn(checkIn.uuid);
                    }}>delete</FontIcon> :
                    <FontIcon className="material-icons" style={{ fontSize: '20px ' }} onClick={() => {
                      setProperty('editTerminal.terminal', {});
                      setProperty('posts.editPost', {});
                    }}>close</FontIcon>
                }

              </div>
              <div className={s.positionValue}>
                { positionElem }
              </div>
            </div>
          </div>
        </div>
        <div className={s.postContent}>
          {
            ((!editPost.uuid && !editTerminal.uuid && !addPost) || newCheckIn) &&
            <div className={s.contentTypeContainer}>
              <div className={s.contentTypeSelectors}>
                { typeSelector('tag_faces', selectedType === 'reaction', () => setProperty('posts.addType', 'reaction')) }
                { typeSelector('call_made', selectedType === 'departure', () => setProperty('posts.addType', 'departure')) }
                { typeSelector('call_received', selectedType === 'arrival', () => setProperty('posts.addType', 'arrival')) }
                { typeSelector('hotel', selectedType === 'lodging', () => setProperty('posts.addType', 'lodging')) }
              </div>
            </div>
          }
          { showEditor && getTabContent(selectedType, props) }
        </div>
      </div>
      {
        showContent &&
          <CheckInItemContent transportTypes={transportTypes} checkInItem={checkInItem} contentType={selectedType} frameId={frameId} editPost={editPost} editable />
      }
    </div>
  );

};

EditCheckInItemView.contextTypes = { setTitle: PropTypes.func.isRequired };

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
    editPost: state.posts.editPost || {},
    addPost: state.posts.addPost,
    disabledTags: state.posts.disabledTags || [],
    editTerminal: state.editTerminal.terminal || {},
    savedTerminal: state.editTerminal.savedTerminal,
    env: state.env
  }), {
    setProperty,
    getGeolocation,
    savePost,
    uploadFiles,
    saveCheckIn,
    getMediaItem,
    deleteCheckIn,
  })(withStyles(s)(EditCheckInItemView))
);
