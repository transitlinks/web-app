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

const LinkInstanceMedia = ({
  setProperty, 
  uploadFiles, getMediaItems,
  linkInstance,
  media, newMedia, addedMedia,
  env, user, mediaDialogOpen 
}) => {
  
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

  const mediaItemElems = instanceMedia.map((item) => (
    <div key={item.uuid} className={cx(s.mediaItem, s.mediaThumbnail)}>
      <img src={env.MEDIA_URL + item.url} />
    </div>
  ));

  return (
    <div className={s.instanceMedia}>
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
