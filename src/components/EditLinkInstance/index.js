import React from 'react';
import { connect } from 'react-redux';
import { saveLinkInstance, setTransport } from '../../actions/editLink';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditLinkInstance.css';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import LocalityAutocomplete from './LocalityAutocomplete';

const EditLinkInstance = ({ 
  saveLinkInstance, setTransport,
  linkInstance, transportTypes,  
  from, to, transport 
}) => {
   
  const onSave = () => {
    saveLinkInstance({ linkInstance: { from, to, transport } });
  };
  
  const onChangeTransport = (event, index, value) => {
    setTransport(value);
  };

  const transportOptions = transportTypes.map(type => (
    <MenuItem key={type.slug} style={{ "WebkitAppearance": "initial" }} 
      value={type.slug} primaryText={type.slug} />
  ));
  
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
          <SelectField id="transport-select"
            value={transport} 
            onChange={onChangeTransport.bind(this)}
            floatingLabelText="Transport"
            floatingLabelFixed={true}
            hintText="Select transport type">
            {transportOptions}
          </SelectField>
        </div>
        <div className={s.times}>
          <div>
          </div>
          <div>
          </div>
        </div>
        <div className={s.terminals}>
        </div>
        <div className={s.price}>
        </div>
        <div className={s.description}>
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
  transport: state.editLink.transport,
  linkInstance: state.editLink.linkInstance
}), {
  saveLinkInstance,
  setTransport
})(withStyles(s)(EditLinkInstance));
