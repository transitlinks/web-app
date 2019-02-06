import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Add.css';
import Link from '../Link';
import { getGeolocation } from '../../actions/global';
import { savePost, saveCheckIn } from '../../actions/posts';
import { setProperty } from '../../actions/properties';
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
  if (position) {
    const { coords: { latitude, longitude } } = position;
    return { latitude, longitude };
  }

  return null;

};

const createPost = (props) =>  {

  const { postText, checkIn } = props;

  return {
    post: {
      text: postText,
      checkInUuid: checkIn.uuid
    }
  };

}

const getTabContent = (type, props) => {

  switch (type) {

    case 'reaction':

      const { postText, savePost, setProperty } = props;

      return (
        <div className={s.contentEditor}>
          <div className={s.contentHorizontal}>
            <div className={s.commentContainer}>
              <TextField id="post-text"
                         value={postText}
                         multiLine={true}
                         fullWidth={true}
                         rows={2}
                         onChange={(e) => setProperty('add.postText', e.target.value)}
                         hintText={(!postText) ? "What's up?" : null}
                         hintStyle={{ bottom: '36px'}}
              />
            </div>
          </div>
          <div className={s.contentControls}>
            <div className={s.addMediaContainer}>
              <div className={s.addMediaButton}>
                <input type="file" name="file" id="file" className={s.fileInput} />
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
          Arrival
        </div>
      );
    case 'departure':
      return (
        <div className={s.contentEditor}>
          Departure
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

  const { type, intl, geolocation, postText, setProperty, getGeolocation, savePost, saveCheckIn } = props;

  let positionElem = null;
  if (geolocation) {
    if (geolocation.status === 'located') {
      const { position } = geolocation;
      positionElem = (
        <div>
          { formatCoords(position.coords) }
        </div>
      );
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

	return (
	  <div className={s.root}>
      <div className={s.container}>
        <div className={s.placeSelector}>
          <div className={s.positionContainer}>
            <div className={s.positionSelector}>
              <div className={s.editPositionButton} onClick={() => saveCheckIn({ checkIn: createCheckIn(geolocation) })}>
                Change
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
              { typeSelector('tag_faces', type === 'reaction', () => setProperty('add.type', 'reaction')) }
              { typeSelector('call_received', type === 'arrival', () => setProperty('add.type', 'arrival')) }
              { typeSelector('call_made', type === 'departure', () => setProperty('add.type', 'departure')) }
              { typeSelector('hotel', type === 'lodging', () => setProperty('add.type', 'lodging')) }
            </div>
          </div>
          { getTabContent(type, props) }
        </div>
      </div>
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
    type: state.posts.type || 'reaction'
  }), {
    setProperty,
    getGeolocation,
    savePost,
    saveCheckIn
  })(withStyles(s)(AddView))
);
