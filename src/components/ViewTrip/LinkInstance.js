import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ViewTransitLink.css';
import FontIcon from 'material-ui/FontIcon';
import Chip from 'material-ui/Chip';
import { orange600, green600 } from 'material-ui/styles/colors';
import { formatDuration } from '../utils';
import msgTransport from '../common/messages/transport';

const LinkInstance = ({
  instance, navigate
}) => {

  const modeBackgrounds = {
    'research': orange600,
    'experience': green600
  };

  return (
  
    <div key={instance.uuid} className={"table-row " + s.selectable + " " + s.instance}
      onClick={() => navigate('/link-instance/' + instance.uuid)}>
      <div className="col-1-4">
        <div className={s.mode}>
          <Chip backgroundColor={modeBackgrounds[instance.mode]}>
            {instance.mode === 'research' ? 'R' : 'E'}
          </Chip>
        </div>
        <div className={s.transport}>
          <FormattedMessage { ...msgTransport[instance.transport.slug] } />
        </div>
      </div>
      <div className="col-1-4">{formatDuration(instance.durationMinutes)}</div>
      <div className="col-1-4">{instance.priceAmount} {instance.priceCurrency}</div>
      <div className="col-1-4">{instance.avgRating}</div>
    </div>
  
  );

};

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(LinkInstance));
