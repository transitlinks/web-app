import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LinkInstanceMedia.css';
import cx from 'classnames';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import { uploadFiles } from '../../actions/viewLinkInstance';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';

const LinkInstanceMedia = ({
  setProperty, 
  uploadFiles,
  linkInstance,
  user, mediaDialogOpen 
}) => {
  
  const toggleMediaDialog = () => {
    if (mediaDialogOpen) {
      setProperty('mediaDialogOpen', false);
    } else {
      setProperty('mediaDialogOpen', true);
    }
  };

  const onFileInputChange = (event) => {
    console.log("file input", event.target.files);
    uploadFiles(linkInstance.uuid, event.target.files);
  };

	const mediaDialogActions = [
		<FlatButton key="cancel"
			label="Cancel"
			primary={true}
			onTouchTap={toggleMediaDialog} />
  ];
  
  const mediaItemElems = [0,1,2,3,4,5,6,7,8,9,10].map((item) => (
    <div key={item} className={cx(s.mediaItem, s.mediaThumbnail)}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Tennispalatsi.jpg/250px-Tennispalatsi.jpg" />
    </div>
  ));

  return (
    <div className={s.instanceMedia}>
      <div className={s.mediaHeader}>
        Gallery
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
              <input id="upload-input" type="file" name="uploads[]" 
                multiple="multiple" 
                onChange={onFileInputChange}/>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );

}

export default connect(state => ({
  user: state.auth.auth.user,
  mediaDialogOpen: state.viewLinkInstance.mediaDialogOpen
}), {
  setProperty, uploadFiles
})(withStyles(s)(LinkInstanceMedia));
