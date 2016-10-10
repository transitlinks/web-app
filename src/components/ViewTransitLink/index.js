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
    <div key={instance.id} className={s.instanceRow + " " +s.selectable}
      onClick={() => navigate('/link-instance/' + instance.id)}>
      <div className={s.cell}>
        <span className={s.transport}>{instance.transport.slug}</span>
      </div>
      <div className={s.cell}>{instance.priceAmount} {instance.priceCurrency}</div>
    </div>
  ));

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <span id="place-from">{link.from.description}</span>
          <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
          <span id="place-to">{link.to.description}</span>
        </div>
      </div>
      <div className={s.instances}>
        <div className={s.instanceHeader + " " + s.instanceRow}>
          <div className={s.cell}>Transport</div>
          <div className={s.cell}>Price</div>
        </div>
        {instances}
      </div>
    </div>
  );
}

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(ViewTransitLink));
