import React from 'react';
import { connect } from 'react-redux';
import { saveLink } from '../../actions/editLink';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditTransitLink.css';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import LocalityAutocomplete from './LocalityAutocomplete';

const EditTransitLink = ({ saveLink, link, from, to }) => {
  
  console.log("link", link, from, to); 
  
  const onSave = () => {
    saveLink({ link: { from, to } });
  };
   
  return (
    <div className={s.container}>
      <div>
        <LocalityAutocomplete endpoint="from" items={[]} />
        <FontIcon className="material-icons">arrow_forward</FontIcon>
        <LocalityAutocomplete endpoint="to" items={[]} />
      </div>
      <div>
        <RaisedButton label="Save" onClick={onSave} />
      </div>
    </div>
  );
}

export default connect(state => ({
  from: state.editLink.from,
  to: state.editLink.to
}), {
  saveLink
})(withStyles(s)(EditTransitLink));
