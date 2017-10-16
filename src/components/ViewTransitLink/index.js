import React from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormattedMessage } from 'react-intl';
import s from './ViewTransitLink.css';
import FontIcon from 'material-ui/FontIcon';
import Chip from 'material-ui/Chip';
import LinkInstance from './LinkInstance';
import { orange600, green600 } from 'material-ui/styles/colors';
import { formatDuration, extractLinkAreas } from '../utils';
import msgTransport from '../common/messages/transport';
 
const ViewTransitLink = ({ 
  link, navigate 
}) => {

  const instances = link.instances.map(instance => <LinkInstance instance={instance} />);

  const areas = extractLinkAreas(link);

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.title}>
          <div id="place-from">
            <div>
              {areas.fromCity}
            </div>
            <div className={s.area}>
              {areas.fromArea}
            </div>
          </div>
          <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
          <div id="place-to">
            <div>
              {areas.toCity}
            </div>
            <div className={s.area}>
              {areas.toArea}
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
