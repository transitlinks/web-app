import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import NewCheckIn from '../NewCheckIn';
import FilterHeader from '../FilterHeader';
import ErrorHeader from '../ErrorHeader';

import Feed from '../Feed';

import { injectIntl } from 'react-intl';

const HomeView = ({ intl, setProperty, feed, transportTypes, post, error }) => {

  let filterHeader = null;
  if (feed.query) {

    const { user, tags, locality } = feed.query;
    const filterOptions = {
      icon: 'directions',
      tag: tags,
      locality
    };

    if (user) {
      filterOptions.user = {
        uuid: user,
        userName: feed.user,
        userImage: feed.userImage
      };
    }

    filterHeader = <FilterHeader {...filterOptions} />;

  }



	return (
    <div className={s.container}>
      <div>
        {
          filterHeader || <NewCheckIn />
        }
      </div>
      <div>
        <ErrorHeader />
        <Feed post={post} feed={feed} transportTypes={transportTypes} post={post} />
      </div>
    </div>
  );

};

HomeView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    breakdownSelected: state.home.breakdownSelected,
    error: state.posts.error
  }), {
    setProperty
  })(withStyles(s)(HomeView))
);
