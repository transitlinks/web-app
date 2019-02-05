import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { extractLinkAreas } from '../utils';
import s from './FeedItem.css';
import FontIcon from 'material-ui/FontIcon';
import msg from './messages';

const FeedItem = ({
  checkIn, navigate
}) => {

  return (
    <div className={s.container}>
      <div className={s.link} onClick={() => navigate('/check-in/' + checkIn.checkIn.uuid)}>
        <div className={s.linkTitle}>
          { checkIn.checkIn.latitude }, { checkIn.checkIn.longitude }
        </div>
      </div>
    </div>
  );

};

export default connect(state => ({
}), {
  navigate
})(withStyles(s)(FeedItem));
