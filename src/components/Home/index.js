import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import NewCheckIn from '../NewCheckIn';
import FilterHeader, {
  renderLinkedLocalityLabel,
  renderLocalityLabel,
  renderRouteLabel,
  renderTagLabel,
} from '../FilterHeader';
import ErrorHeader from '../ErrorHeader';

import Feed from '../Feed';

import { injectIntl } from 'react-intl';

const HomeView = ({ intl, setProperty, feed, query, transportTypes, post, error }) => {

  let filterOptions = null;

  const { user, tags, locality, linkedLocality, from, to, route } = query;

  const userData = feed.user && {
    uuid: user,
    userName: feed.user,
    userImage: feed.userImage
  };

  if (from && to) {
    filterOptions = {
      from,
      to,
      label: renderRouteLabel(from, to),
      getUrl: () => `/links?from=${from}&to=${to}&route=${route}`,
      clearUrl: `/?locality=${from}`
    };
  } else if (tags) {
    filterOptions = {
      label: renderTagLabel(tags, userData),
      tag: tags,
      getUrl: () => {
        let url = '/links?tag=' + tags;
        if (userData) url += '&user=' + userData.uuid + '&view=map';
        return url;
      }
    };
  } else if (locality && linkedLocality) {
    filterOptions = {
      locality,
      label: renderLinkedLocalityLabel(locality, linkedLocality, `/?locality=${linkedLocality}&linkedLocality=${locality}`),
      getUrl: () => `/links?locality=${locality}&linkedLocality=${linkedLocality}&view=map`,
      clearUrl: `/?locality=${locality}`
    };
  } else if (locality) {
    filterOptions = {
      locality,
      label: renderLocalityLabel(locality),
      getUrl: () => `/links?locality=${locality}&view=map`
    };
  }

  if (userData) filterOptions.user = userData;

	return (
    <div className={s.container}>
      <div>
        {
          filterOptions ?
            <FilterHeader {...{ icon: 'directions', ...filterOptions }} /> :
            <NewCheckIn />
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
