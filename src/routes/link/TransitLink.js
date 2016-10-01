import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TransitLink.css';
import ViewTransitLink from '../../components/TransitLink';
import EditTransitLink from '../../components/EditTransitLink';
import { FormattedRelative } from 'react-intl';

const title = 'Transitlinks - Link';

class TransitLink extends React.Component {

  constructor(props) {
    
    super(props);
    
    this.state = {
      edit: props.edit,
      link: props.link,
      updated: 0
    };
  
  }
  
  componentWillReceiveProps(props) {
    
    // Transition to link when save is detected    
    const stateUpdated = this.state.updated;
    const propUpdated = props.saved ? props.saved.saved : stateUpdated;
    this.setState({
      edit: props.edit,
      link: (propUpdated > stateUpdated) ? props.saved : props.link,
      updated: propUpdated
    });
     
    if (propUpdated > stateUpdated) {
      props.navigate(`/link/${props.saved.id}`);
    }

  }
  
  render() {
    
    this.context.setTitle(title);
    const link = this.props.link;
    
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1 className={s.title}>Link</h1>
          { 
            !this.state.edit ?
              <ViewTransitLink link={link} /> :
              <EditTransitLink link={link} />
          }
          <div>

          </div>
        </div>
      </div>
    );

  }

}

TransitLink.propTypes = {
  link: PropTypes.object.isRequired
};
TransitLink.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  saved: state.editLink.link
}), {
  navigate
})(withStyles(s)(TransitLink));
