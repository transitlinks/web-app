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

const LinksView = ({ links, loadedLinks,  transportTypes }) => {

  let  displayLinks = (loadedLinks || links) || [];

  return (
    <div className={s.container}>
      <div>
        {

          (displayLinks || []).map((link, index) => {

            const { uuid } = link;

            return (
              <div key={uuid} className={s.linkItem}>
                <div className={s.from}>
                  <b>From:</b> { link.from.formattedAddress }
                </div>
                <div className={s.to}>
                  <b>To:</b> { link.to.formattedAddress }
                </div>
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
  connect(state => {
    return {
      loadedLinks: state.links.transitLinks,
      fetchedFeedItems: state.posts.fetchedFeedItems || {},
      feedUpdated: state.posts.feedUpdated
    }
  }, {
    getDiscoveries
  })(withStyles(s)(LinksView))
);
