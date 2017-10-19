import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { resetLink } from '../../actions/editLink';
import { getComments } from '../../actions/viewLinkInstance';
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
    
    if (props.deleted && props.deleted.uuid === props.linkInstance.uuid) {
      props.resetLink();
      props.navigate(`/link/${props.linkInstance.link.uuid}?deleted=1`);
      return;
    }

    // Transition to link when save is detected    
    const stateUpdated = this.state.updated;
    const propUpdated = props.saved ? props.saved.saved : stateUpdated;
    
    const state = {
      edit: props.edit,
      linkInstance: (propUpdated > stateUpdated) ? props.saved : props.linkInstance,
      updated: propUpdated
    };
    
    const { savedCommentUuid } = this.state; 
    if (props.savedComment) {
      if (!savedCommentUuid || savedCommentUuid !== props.savedComment.uuid) {
        props.getComments(this.state.linkInstance.uuid);
      }
      state.savedCommentUuid = props.savedComment.uuid;
    }

    this.setState(state);
      
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
      linkInstanceMedia,
      transportTypes,
      comments,
      stateComments
    }  = this.props;
    
    return (
      <div className={s.root}>
        <div className={s.container}>
          { 
            !this.state.edit ?
              <ViewLinkInstance 
                linkInstance={linkInstance} 
                initialRatings={ratings} 
                linkInstanceMedia={linkInstanceMedia} 
                comments={stateComments || comments} /> :
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
  saved: state.editLink.linkInstance,
  deleted: state.editLink.deleteLinkInstance,
  savedComment: state.viewLinkInstance.savedComment,
  stateComments: state.viewLinkInstance.comments,
}), {
  resetLink, getComments, navigate
})(withStyles(s)(LinkInstance));
