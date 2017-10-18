import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LinkInstanceMedia.css';
import cx from 'classnames';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { uploadFiles, getMediaItems } from '../../actions/viewLinkInstance';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';

const IMAGE_TYPES = [ 'png', 'jpg', 'jpeg', 'gif' ];
const VIDEO_TYPES = [ 'youtube' ];

const LinkInstanceMedia = ({
  setProperty, 
  uploadFiles, getMediaItems,
  linkInstance,
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
    uploadFiles(linkInstance.uuid, event.target.files);
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
          <img src={env.MEDIA_URL + instanceMedia[selectedItemIndex].url} />
        </div>
      </div>
    </div>
  ) : null;

  const mediaItemElems = instanceMedia.map((item) => (
    <div key={item.uuid} className={cx(s.mediaItem, s.mediaThumbnail)}
      onClick={() => openMediaView(item)}>
      <img src={env.MEDIA_URL + item.url} />
    </div>
  ));

  return (
    <div className={s.instanceMedia}>
      { mediaView }
      <div className={s.mediaHeader}>
        Media
      </div>
      <div className={s.mediaContent}>
        {mediaItemElems}
        { 
          <div className={cx(s.mediaItem, s.addMedia)}
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
              <input id="upload-input" type="file" name="uploads[]" accept="image/*" 
                onChange={onFileInputChange}/>
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
    mediaDialogOpen: state.viewLinkInstance.mediaDialogOpen,
    selectedItemIndex: state.viewLinkInstance.selectedItemIndex,
    newMedia: state.viewLinkInstance.newMedia,
    addedMedia: state.viewLinkInstance.addedMedia,
    env: state.env
  };

  if (state.viewLinkInstance.linkInstanceMedia) {
    endState.media = state.viewLinkInstance.linkInstanceMedia;
  }

  return endState;

}, {
  setProperty, uploadFiles, getMediaItems
})(withStyles(s)(LinkInstanceMedia));
