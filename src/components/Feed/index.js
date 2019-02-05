import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Feed.css';
import FontIcon from 'material-ui/FontIcon';
import Link from '../Link';
import FeedItem from './FeedItem';
import Add from '../Add'
import msg from './messages';

const FeedView = ({
  checkIns, loadedCheckIns, savedCheckIn, navigate
}) => {

  return (
    <div className={s.container}>
      <div className={s.header}>
      </div>
      <div className={s.results}>
        {
          ((loadedCheckIns || checkIns) || []).map(checkIn => {
            if (!savedCheckIn || savedCheckIn.uuid !== checkIn.uuid) {
              return <FeedItem checkIn={checkIn} key={checkIn.checkIn.uuid} />;
            } else {
              return <Add checkIn={checkIn} />
            }

          })
        }
      </div>
    </div>
  );
};

export default connect(state => ({
  loadedCheckIns: state.posts.checkIns,
  savedCheckIn: state.posts.checkIn
}), {
  navigate
})(withStyles(s)(FeedView));
