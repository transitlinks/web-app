import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CheckInMedia.css';
import cx from 'classnames';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { uploadFiles, getMediaItems } from '../../actions/viewCheckIn';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';

const IMAGE_TYPES = [ 'png', 'jpg', 'jpeg', 'gif' ];
const VIDEO_TYPES = [ 'youtube' ];

const CheckInMedia = ({
  setProperty,
  uploadFiles, getMediaItems,
  checkIn,
  media, newMedia, addedMedia,
  env, user, mediaDialogOpen,
  selectedItemIndex
}) => {

  const handleOutsideClick = (event) => {

    const element = document.getElementById('media-view');

    if (!element) return;

    if (element.contains(event.target)) {
       // Click inside media view
      console.log("clicked inside");
    } else {
      console.log("clicked outside");
      closeMediaView();
    }

  };

  const addOutsideClickListener = () => {
    window.addEventListener('click', handleOutsideClick);
  }

  const removeOutsideClickListener = () => {
    window.removeEventListener('click', handleOutsideClick);
  }

  const toggleMediaDialog = () => {
    if (mediaDialogOpen) {
      setProperty('mediaDialogOpen', false);
    } else {
      setProperty('mediaDialogOpen', true);
    }
  };

  const onFileInputChange = (event) => {
    uploadFiles(checkIn.uuid, event.target.files);
  };

	const mediaDialogActions = [
		<FlatButton key="cancel"
			label="Cancel"
			primary={true}
			onTouchTap={toggleMediaDialog} />
  ];

  let instanceMedia = media || [];
  if (addedMedia) {
    instanceMedia = instanceMedia.concat(addedMedia);
  }

  const closeMediaView = () => {
    removeOutsideClickListener();
    setTimeout(() => setProperty('selectedItemIndex', null), 10);
  };

  const openMediaView = (item) => {
    for (let itemIndex in instanceMedia) {
      if (item.uuid === instanceMedia[itemIndex].uuid) {
        removeOutsideClickListener();
        setTimeout(() => {
          setProperty('selectedItemIndex', itemIndex);
          addOutsideClickListener();
          window.scrollTo(0, 0);
        }, 20);
        return;
      }
    }
  };

  console.log("instance media", selectedItemIndex, instanceMedia);

  const mediaView = selectedItemIndex ? (
    <div>
      <div className={s.mediaViewBackground}></div>
      <div id="media-view" className={s.mediaView}>
        <div className={s.closeMediaView} onClick={() => closeMediaView()}>
          Close
        </div>
        <div className={s.mediaContent}>
          {
            instanceMedia[selectedItemIndex].type === 'image' ?
              <img className="mediaLarge"
                src={env.MEDIA_URL + instanceMedia[selectedItemIndex].url} /> :
              <iframe width="420" height="315"
                src={`https://www.youtube.com/embed/${instanceMedia[selectedItemIndex].url}`}>
              </iframe>
          }
        </div>
      </div>
    </div>
  ) : null;

  const mediaItemElems = instanceMedia.map((item) => {

    const imgSrc = item.type === 'image' ?
      env.MEDIA_URL + item.url : item.thumbnail;

    return (
      <div key={item.uuid} className={cx(s.mediaItem, s.mediaThumbnail)}
        onClick={() => openMediaView(item)}>
        <img className="mediaThumb" src={imgSrc} />
      </div>
    );

  });

  return (
    <div className={s.instanceMedia}>
      { mediaView }
      <div className={s.mediaHeader}>
        Media
      </div>
      <div className={s.mediaContent}>
        {mediaItemElems}
        {
          <div id="add-media" className={cx(s.mediaItem, s.addMedia)}
            onClick={() => toggleMediaDialog()}>
            <div className="material-icons">add</div>
          </div>
        }
        <Dialog
          contentStyle={{ maxWidth: '600px' }}
          title={`Add media`}
          actions={mediaDialogActions}
          modal={false}
          open={mediaDialogOpen || false}
          onRequestClose={toggleMediaDialog}>
          <div className={s.mapContainer}>
            <div id="media-dialog" className={s.mediaDialog}>
              <form id="upload-form">
                <input id="upload-input"
                  type="file" name="uploads[]" accept="image/*"
                  onChange={onFileInputChange} />
              </form>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );

}

export default connect((state) => {

  const endState = {
    user: state.auth.auth.user,
    mediaDialogOpen: state.viewCheckIn.mediaDialogOpen,
    selectedItemIndex: state.viewCheckIn.selectedItemIndex,
    newMedia: state.viewCheckIn.newMedia,
    addedMedia: state.viewCheckIn.addedMedia,
    env: state.env
  };

  if (state.viewCheckIn.checkInMedia) {
    endState.media = state.viewCheckIn.checkInMedia;
  }

  return endState;

}, {
  setProperty, uploadFiles, getMediaItems
})(withStyles(s)(CheckInMedia));
