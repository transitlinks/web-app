import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import Post from '../Post';
import Terminal from '../Terminal';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Discover.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const DiscoverView = ({ discover, children, intl }) => {

  const { discoveries } = discover;

  console.log("show discoveries", discoveries);

	return (
    <div className={s.container}>
      <div>
        {

          (discoveries || []).map(discovery => {

            const { posts, departures, arrivals } = discovery;

            return (
              <div key={discovery.groupName}>
                <div>
                  { discovery.groupName || 'Ungrouped' }
                </div>
                <div>
                  {
                    posts.map(post => {
                      return <Post post={post} />;
                    })
                  }
                </div>
                <div>
                  {
                    departures.map(departure => {
                      return <Terminal terminal={departure} />;
                    })
                  }
                </div>
                <div>
                  {
                    arrivals.map(arrival => {
                      return <Terminal terminal={arrival} />;
                    })
                  }
                </div>
                <div>
                  Posts: {posts.length}, Departures: {departures.length}, Arrivals: {arrivals.length}
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
