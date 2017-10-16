import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas } from '../utils';
import s from './TransitLink.css';
import FontIcon from 'material-ui/FontIcon';
import msg from './messages';

const TransitLink = ({
  link, navigate
}) => {

  const areas = extractLinkAreas(link);

  return (
    <div key={link.uuid}
      className={s.link} onClick={() => navigate('/link/' + link.uuid)}>
      <div className={s.linkTitle}>
        <div id="place-from" className="locality">
          <div className={s.city}>
            {areas.fromCity}
          </div>
          <div className={s.area}>
            {areas.fromArea}
          </div>
        </div>
        <FontIcon className={s.arrow + " material-icons"}>arrow_forward</FontIcon>
        <div id="place-to" className="locality">
          <div className={s.city}>
            {areas.toCity}
          </div>
          <div className={s.area}>
            {areas.toArea}
          </div>
        </div>
      </div>
      <div className={s.linkStats}>
        ({`${link.instanceCount}`})
      </div>
    </div>
  );

};

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(TransitLink));
