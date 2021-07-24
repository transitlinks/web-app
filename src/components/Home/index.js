import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import NewCheckIn from '../NewCheckIn';
import FilterHeader, {
  renderCountryLabel,
  renderLinkedLocalityLabel,
  renderLocalityLabel,
  renderRouteLabel,
  renderTagLabel,
  renderTripLabel,
  renderUserLabel
} from '../FilterHeader';
import ErrorHeader from '../ErrorHeader';

import Feed from '../Feed';

import { injectIntl } from 'react-intl';

const HomeView = ({ feed, query, transportTypes, post }) => {

  let filterOptions = null;

  const { user, tags, trip, locality, country, linkedLocality, from, to, route } = query;

  const userData = feed.user && {
    uuid: user,
    userName: feed.user.username || feed.user.firstName + ' ' + feed.user.lastName,
    userImage: feed.userImage
  };

  if (from && to) {
    filterOptions = {
      from,
      to,
      label: renderRouteLabel(feed.from, feed.to),
      getUrl: () => `/links?from=${from}&to=${to}&route=${route}&view=map`,
      clearUrl: `/?locality=${from}`
    };
  } else if (tags) {
    filterOptions = {
      label: renderTagLabel(tags, userData),
      tag: tags
    };
  } else if (trip) {
    filterOptions = {
      label: renderTripLabel(feed.tripName, userData),
      tag: trip,
      getUrl: () => {
        const url = '/links?trip=' + trip + '&view=map';
        return url;
      }
    };
  } else if (country) {
    filterOptions = {
      country,
      label: renderCountryLabel(country),
      getUrl: () => `/links?country=${country}&view=map`
    };
  } else if (locality && linkedLocality) {
    filterOptions = {
      locality: feed.locality,
      label: renderLinkedLocalityLabel(feed.locality, feed.linkedLocality, `/?locality=${linkedLocality}&linkedLocality=${locality}`),
      getUrl: () => `/links?localityUuid=${locality}&linkedLocalityUuid=${linkedLocality}&view=map`,
      clearUrl: `/?locality=${locality}`
    };
  } else if (locality) {
    filterOptions = {
      locality: feed.locality,
      label: renderLocalityLabel(feed.locality),
      getUrl: () => `/links?localityUuid=${locality}&view=map`
    };
  } else if (user && userData) {
    filterOptions = {
      label: renderUserLabel(userData)
    };
  }

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
