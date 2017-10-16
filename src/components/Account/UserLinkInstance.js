import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas, formatDate } from '../utils';
import s from './UserLinkInstance.css';
import FontIcon from 'material-ui/FontIcon';
import msgTransport from '../common/messages/transport';

const UserLinkInstance = ({
  instance, navigate
}) => {

  const areas = extractLinkAreas(instance.link);
  const date = new Date(instance.departureDate || instance.createdAt);
  
  return (
    <div key={instance.uuid}
      className={s.link} onClick={() => navigate('/link-instance/' + instance.uuid)}>
      <div className={s.linkDate}>
        {formatDate(date)}
      </div>
      <div className={s.linkTitle}>
        <div id="place-from" className="locality">
          <div className={s.city}>
            {areas.fromCity}
          </div>
        </div>
        <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
        <div id="place-to" className="locality">
          <div className={s.city}>
            {areas.toCity}
          </div>
        </div>
      </div>
    </div>
  );

};

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(UserLinkInstance));
