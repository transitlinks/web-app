import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { resetLink } from '../../actions/editLink';
import { navigate } from '../../actions/route';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './LinkInstance.css';
import ViewLinkInstance from '../../components/ViewLinkInstance';
import EditLinkInstance from '../../components/EditLinkInstance';
import { FormattedRelative } from 'react-intl';

const title = 'Transitlinks - Link';

class LinkInstance extends React.Component {

  constructor(props) {
    
    super(props);
    
    this.state = {
      edit: props.edit,
      linkInstance: props.linkInstance,
      updated: 0
    };
  
  }

  componentWillReceiveProps(props) {
    this.updateComponent(props);
  }
  
  componentDidMount() {
    this.updateComponent(this.props);
  }

  updateComponent(props) {
    
    console.log("linkInstanmce will receive props", props);
    // Transition to link when save is detected    
    const stateUpdated = this.state.updated;
    const propUpdated = props.saved ? props.saved.saved : stateUpdated;
    this.setState({
      edit: props.edit,
      linkInstance: (propUpdated > stateUpdated) ? props.saved : props.linkInstance,
      updated: propUpdated
    });
      
    if (propUpdated > stateUpdated) {
      props.resetLink();
      props.navigate(`/link-instance/${props.saved.privateUuid}`);
      return;
    }
    
    if (props.edit) {
      props.resetLink(props.linkInstance);
    }
    
  }
  
  render() {
    
    this.context.setTitle(title);
    const {
      linkInstance,
      ratings,
      transportTypes
    }  = this.props;
    
    console.log("link instance state", this.state, this.props);

    return (
      <div className={s.root}>
        <div className={s.container}>
          { 
            !this.state.edit ?
              <ViewLinkInstance linkInstance={linkInstance} initialRatings={ratings} /> :
              <EditLinkInstance 
                transportTypes={transportTypes}
                linkInstance={linkInstance} />
          }
          <div>

          </div>
        </div>
      </div>
    );

  }

}

LinkInstance.propTypes = {
  linkInstance: PropTypes.object.isRequired
};
LinkInstance.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  saved: state.editLink.linkInstance
}), {
  resetLink, navigate
})(withStyles(s)(LinkInstance));
