import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import PostCollection from './PostCollection';
import Terminal from '../Terminal';
import FontIcon from 'material-ui/FontIcon';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Discover.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const DiscoverView = ({ discover, children, intl }) => {

  const { discoveries } = discover;

  console.log("show discoveries", discoveries);

  const renderTerminalsList = (terminalType, terminals) => {

    /*
    const terminalLocations = {
      "St. Petersburg": 1,
      "New York": 1,
      "Calcutta": 1,
      "Paris": 1,
      "Minneapolis": 1
    };
    */

    const terminalLocations = {};
    terminals.forEach(terminal => {
      if (terminal.linkedTerminal) {
        terminalLocations[terminal.linkedTerminal.checkIn.locality] = 1;
      }
    });

    const locationLabels = Object.keys(terminalLocations);

    return (
      <div className={s.terminalsByType}>
        <div className={s.terminalTypeSummary}>
          <div className={s.terminalTypeIcon}>
            <FontIcon className="material-icons" style={{ fontSize: '20px' }}>{ terminalType === 'arrival' ? 'call_received' : 'call_made' }</FontIcon>
          </div>
          <div className={s.terminalTypeValue}>
            <a href="#">{terminals.length}</a>
          </div>
        </div>
        <div className={s.destinationList}>
          {
            locationLabels.map((locationLabel, i) => (
              <span>
                <a href="#">{locationLabel}</a>
                {
                  (i < locationLabels.length - 1) && (<span>, </span>)
                }
              </span>
            ))
          }
        </div>
      </div>
    );
  };

	return (
    <div className={s.container}>
      <div>
        {

          (discoveries || []).map(discovery => {

            const { posts, departures, arrivals } = discovery;

            return (
              <div key={discovery.groupName} className={s.discoveryItem}>
                <div className={s.discoveryHeader}>
                  { discovery.groupName || 'Ungrouped' }
                </div>
                <div className={s.terminalSummary}>
                  { renderTerminalsList('arrival', arrivals) }
                  { renderTerminalsList('departure', departures) }
                </div>
                <div className={s.postSummary}>
                  <PostCollection posts={posts} />
                </div>
              </div>
            )

          })
        }
      </div>
    </div>
  );

};

DiscoverView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
  }), {
  })(withStyles(s)(DiscoverView))
);
