import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TransitLink.css';
import ViewTransitLink from '../../components/ViewTransitLink';
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
  
  render() {
    
    this.context.setTitle(title);
    const link = this.props.link;
    
    return (
      <div className={s.root}>
        <div className={s.container}>
          <ViewTransitLink link={link} /> :
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
}), {
})(withStyles(s)(TransitLink));
