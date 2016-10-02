import React from 'react';
import { connect } from 'react-redux';
import { saveLink, setTransport } from '../../actions/editLink';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditTransitLink.css';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import LocalityAutocomplete from './LocalityAutocomplete';

const EditTransitLink = ({ 
  saveLink, setTransport,
  link, 
  from, to, transport 
}) => {
  
  const onSave = () => {
    saveLink({ link: { from, to, transport } });
  };
  
  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          Add link
        </div>
      </div>
      <div className={s.endpoints}>
        <LocalityAutocomplete endpoint="from" items={[]} />
        <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
        <LocalityAutocomplete endpoint="to" items={[]} />
      </div>
      <div>
        <div>
          <RaisedButton label="Bus" onClick={() => setTransport('bus')} />
          <RaisedButton label="Train" onClick={() => setTransport('train')} />
        </div>
      </div>
      <div className={s.save}>
        <RaisedButton label="Save" onClick={onSave} />
      </div>
    </div>
  );
}

export default connect(state => ({
  from: state.editLink.from,
  to: state.editLink.to,
  transport: state.editLink.transport
}), {
  saveLink,
  setTransport
})(withStyles(s)(EditTransitLink));
