import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import PostCollection from './PostCollection';
import Terminal from '../Terminal';
import CheckInItem from '../CheckInItem';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Links.css';
import Link from '../Link';
import { getDiscoveries } from '../../actions/discover';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const LinksView = ({ terminals, loadedTerminals,  transportTypes }) => {

  let  displayTerminals = ((loadedTerminals || terminals).terminals)|| [];

	return (
    <div className={s.container}>
      <div>
        {

          (displayTerminals || []).map((terminal, index) => {

            const { uuid } = terminal;

            return (
              <div key={discovery.groupName} className={s.discoveryItem}>
                T { uuid }
              </div>
            )

          })
        }
      </div>
    </div>
  );

};

LinksView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    loadedTerminals: state.terminals.terminals,
    fetchedFeedItems: state.posts.fetchedFeedItems || {},
    feedUpdated: state.posts.feedUpdated
  }), {
    getDiscoveries
  })(withStyles(s)(LinksView))
);
