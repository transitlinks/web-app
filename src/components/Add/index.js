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

const typeSelector = (iconName, isSelected) => {
  return (
    <div className={cx(s.contentTypeSelector, isSelected ? s.typeSelected : {})}>
      <div>
        <FontIcon className="material-icons" style={{ fontSize: '20px' }}>{iconName}</FontIcon>
      </div>
    </div>
  );
};

const getCheckIn = (geolocation) => {

  const { position } = geolocation;
  if (position) {
    const { coords: { latitude, longitude } } = position;
    return { latitude, longitude };
  }

  return null;

};

const AddView = ({ type, intl, geolocation, postText, setProperty, getGeolocation, savePost, saveCheckIn }) => {

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
    <div className={s.container}>
      <div className={s.placeSelector}>
        <div className={s.positionContainer}>
          <div className={s.positionButton} onClick={() => getGeolocation()}>
            <FontIcon className="material-icons" style={{ fontSize: '30px' }}>my_location</FontIcon>
          </div>
          <div className={s.positionSelector}>
            { positionElem }
            <div className={s.editPositionButton} onClick={() => saveCheckIn({ checkIn: getCheckIn(geolocation) })}>
              <FontIcon className="material-icons" style={{ fontSize: '28px', color: '#2eb82e' }}>beenhere</FontIcon>
            </div>
          </div>
        </div>
      </div>
      <div className={s.postContent}>
        <div className={s.contentTypeContainer}>
          <div className={s.contentTypeSelectors}>
            { typeSelector('call_received', true) }
            { typeSelector('call_made', false) }
            { typeSelector('hotel', false) }
            { typeSelector('grade', false) }
            { typeSelector('directions_run', false) }
            { typeSelector('tag_faces', false) }
          </div>
        </div>
        <div className={s.contentEditor}>
          <div className={s.contentHorizontal}>
            <div className={s.addMediaContainer}>
              <div className={s.addMediaButton}>
                <input type="file" name="file" id="file" className={s.fileInput} />
                <label htmlFor="file">
                  <FontIcon className="material-icons" style={{ fontSize: '36px' }}>add_a_photo</FontIcon>
                </label>
              </div>
            </div>
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
            <RaisedButton label="Post" disabled={false} onClick={() => savePost({ post: { text: postText } })} />
          </div>
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
    savedCheckIn: state.posts.checkIn
  }), {
    setProperty,
    getGeolocation,
    savePost,
    saveCheckIn
  })(withStyles(s)(AddView))
);
