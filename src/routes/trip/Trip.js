import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Trip.css';
import ViewTrip from '../../components/ViewTrip';
import EditTrip from '../../components/EditTrip';
import EditTabs from '../../components/EditTabs';
import { FormattedRelative } from 'react-intl';

const title = 'Transitlinks - Trip';

class Trip extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      edit: props.edit,
      trip: props.trip,
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

    if (props.deleted && props.deleted.uuid === props.trip.uuid) {
      //props.resetLink();
      props.navigate(`/account?deleted=1`);
      return;
    }

    // Transition to link when save is detected
    const stateUpdated = this.state.updated;
    const propUpdated = props.saved ? props.saved.saved : stateUpdated;

    const state = {
      edit: props.edit,
      trip: (propUpdated > stateUpdated) ? props.saved : props.trip,
      updated: propUpdated
    };

    this.setState(state);

    if (propUpdated > stateUpdated) {
      //props.resetLink();
      props.navigate(`/trip/${props.saved.privateUuid}`);
      return;
    }

    if (props.edit) {
      //props.resetLink(props.linkInstance);
    }

  }

  render() {

    this.context.setTitle(title);

    const {
      trip,
      userLinks
    }  = this.props;

    return (
      <div className={s.root}>
        <div className={s.container}>
          {
            !this.state.edit ?
              <ViewTrip
                trip={trip}
              /> :
              <EditTabs selection="trip">
                <EditTrip
                  trip={trip}
                  userLinks={userLinks} />
              </EditTabs>
          }
          <div>

          </div>
        </div>
      </div>
    );

  }

}

Trip.propTypes = {
  trip: PropTypes.object.isRequired
};
Trip.contextTypes = { setTitle: PropTypes.func.isRequired };

export default connect(state => ({
  saved: state.editLink.linkInstance,
  deleted: state.editLink.deleteLinkInstance
}), {
  navigate
})(withStyles(s)(Trip));
