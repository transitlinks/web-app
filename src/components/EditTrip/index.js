import React from 'react';
import { connect } from 'react-redux';
import { 
  saveTrip, 
  deleteTrip,
  resetTrip,
} from '../../actions/editTrip';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditTrip.css';
import cc from 'currency-codes';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import Rating from 'react-rating';
import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const EditTrip = ({
  intl,
  trip, transportTypes,
  uuid,
  user, userLinks,
  name, description,
  setProperty, saveTrip
}) => {
  
  const onSave = () => {
    saveTrip({
      trip: {
        name,
        description
      }
    });  
  };

  const onDelete = () => {
  };

  const addLinkInstance = (uuid) => {
    
  };

  const onChangeProperty = (property) => {
    return (event, value, selectValue) => {
      setProperty(property, selectValue || value);
    };
  };
  
  const saveDisabled = !name || name.length === 0; 

  const tripLinks = (null || []).map(linkInstance => (
    <div className={s.tripLink}>
      <div className={s.label}>
      </div>
      <div className={s.removeButton}>
        <div onClick={() => removeLinkInstance(linkInstance.uuid)}>Remove</div>
      </div>
    </div>
  ));

  const availableUserLinks = ((userLinks && userLinks.linkInstances) || [])
    .filter(linkInstance => true)
    .map(linkInstance => (
      <div className={s.availableLinkInstance}>
        <div className={s.label}>
          {linkInstance.link.from.name} - {linkInstance.link.to.name}
        </div>
        <div className={s.addButton}>
          <div onClick={() => addLinkInstance(linkInstance.uuid)}>Add</div>
        </div>
      </div>
    ));
  
  console.log("render links", availableUserLinks, userLinks);
  return (
    <div className={s.container}>
      <div className={s.name}>
        <TextField id="trip-name-input"
          style={ { width: '100%'} }
          value={name || ''}
          floatingLabelText="Trip name"
          hintText="My awesome trip"
          onChange={onChangeProperty('tripName')} 
        />
      </div>
      <div className={s.description}>
        <TextField id="trip-description-input"
          value={description}
          hintText="About this trip..."
          floatingLabelText="Trip description"
          hintStyle={ { bottom: '36px' } }
          floatingLabelStyle={ { color: '#000000' } }
          floatingLabelFocusStyle={ { fontSize: '21px', top: '32px' } }
          multiLine={true}
          fullWidth={true}
          rows={2}
          onChange={onChangeProperty('tripDescription')}
        />
      </div>
      <div className={s.tripLinks}>
      </div>
      <div className={s.userLinks}>
        {availableUserLinks}
      </div>
      <div className={s.save}>
        { uuid && <RaisedButton label="Delete" id="delete-button" onClick={onDelete} /> }
        <RaisedButton label="Save" disabled={saveDisabled} onClick={onSave} />
      </div>
    </div>
  );
}

export default injectIntl(
  connect(state => ({
    user: state.auth.auth.user,
    uuid: state.editTrip.uuid,
    name: state.editTrip.tripName,
    description: state.editTrip.tripDescription
  }), {
    setProperty, saveTrip
  })(withStyles(s)(EditTrip))
);
