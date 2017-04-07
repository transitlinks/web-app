import React from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormattedMessage } from 'react-intl';
import s from './ViewTransitLink.css';
import FontIcon from 'material-ui/FontIcon';
import Chip from 'material-ui/Chip';
import { orange600, green600 } from 'material-ui/styles/colors';
import { formatDuration } from '../utils';
import msgTransport from '../common/messages/transport';
 
const ViewTransitLink = ({ 
  link, navigate 
}) => {

  const modeBackgrounds = {
    'research': orange600,
    'experience': green600
  };

  const instances = link.instances.map(instance => (
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
  ));
  
  const fromCommaIndex = link.from.description.indexOf(',');
  const fromCity = link.from.description.substring(0, fromCommaIndex);
  const fromArea = link.from.description.substring(fromCommaIndex + 1);
  
  const toCommaIndex = link.to.description.indexOf(',');
  const toCity = link.to.description.substring(0, toCommaIndex);
  const toArea = link.to.description.substring(toCommaIndex + 1);

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <div id="place-from">
            <div>
              {fromCity}
            </div>
            <div className={s.area}>
              {fromArea}
            </div>
          </div>
          <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
          <div id="place-to">
            <div>
              {toCity}
            </div>
            <div className={s.area}>
              {toArea}
            </div>
          </div>
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
