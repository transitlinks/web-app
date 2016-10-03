import React from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ViewTransitLink.css';
import FontIcon from 'material-ui/FontIcon';

const ViewTransitLink = ({ 
  link, navigate 
}) => {

  const instances = link.instances.map(instance => (
    <div key={instance.id} className={s.instance}
      onClick={() => navigate('/link-instance/' + instance.id)}>
      {instance.transport.slug}
    </div>
  ));

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <span id="place-from">{link.from.name}</span>
          <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
          <span id="place-to">{link.to.name}</span>
        </div>
      </div>
      <div>
        {instances}
      </div>
    </div>
  );
}

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(ViewTransitLink));
