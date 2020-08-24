import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Home.css';
import Add from '../EditCheckInItem';
import NewCheckIn from '../NewCheckIn';
import FilterHeader from '../FilterHeader';
import Feed from '../Feed';
import Link from '../Link';

import { injectIntl } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';

const HomeView = ({ intl, setProperty, feed, transportTypes, post, error }) => {

  const errorClasses = {
    'PrelaunchError': s.prelaunchError
  };

  const errorElems = (!error || !error.errors) ? [] : error.errors.map(err => {
    return (
      <div className={errorClasses[err.name] || s.defaultError}>
        <div>{ err.text }</div>
        <div className={s.okButton}>
          <RaisedButton label="OK" onClick={() => {
            setProperty('posts.error', null);
          }} />
        </div>
      </div>
    );
  });


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
        <div className={s.errors}>
          {errorElems}
        </div>
        <Feed post={post} feed={feed} transportTypes={transportTypes} post={post}/>
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
