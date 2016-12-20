import React from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormattedMessage } from 'react-intl';
import s from './ViewTransitLink.css';
import FontIcon from 'material-ui/FontIcon';
import { formatDuration } from '../utils';
import msgTransport from '../common/messages/transport';
 
const ViewTransitLink = ({ 
  link, navigate 
}) => {

  const instances = link.instances.map(instance => (
    <div key={instance.uuid} className={"table-row " +s.selectable}
      onClick={() => navigate('/link-instance/' + instance.uuid)}>
      <div className="col-1-4">
        <span className={s.transport}>
          <FormattedMessage { ...msgTransport[instance.transport.slug] } />
        </span>
      </div>
      <div className="col-1-4">{formatDuration(instance.durationMinutes)}</div>
      <div className="col-1-4">{instance.priceAmount} {instance.priceCurrency}</div>
      <div className="col-1-4">{instance.avgRating}</div>
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
        <div className={"table-row " + s.instanceHeader}>
          <div className="col-1-4"></div>
          <div className="col-1-4">Duration</div>
          <div className="col-1-4">Price</div>
          <div className="col-1-4">Score</div>
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
