import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setProperty } from '../../actions/properties';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Home.css';
import Link from '../Link';

import { injectIntl, FormattedMessage } from 'react-intl';
import msg from './messages';

const HomeView = ({ intl, setProperty, breakdownSelected }) => {	

  const select = (section) => {
    setProperty('breakdownSelected', section);
  }

  const selection = breakdownSelected || 'find';
  
  const findText = `
    Search transit links contributed by fellow travellers. 
    If someone has travelled or knows of a transit connection, you will find it 
    no matter how remote the place is and how exotic the mode of transportation. 
    Weather it is England, Estonia or Ethiopia, by bus, by boat or by bicycle - we have it!
  `;
  
  const contributeText = `
    Transitlinks is a collaborative resource. By contributing your experience or research, you are
    making the world a better place by building something great that can make difference in the world.
  `;
  
  const shareText = `
    The trips you save in Transitlinks are your precious memories and experiences complete with media you choose to
    add to them and you can share them with your friends and other Transitlinks users. Transitlinks is a community
    of Travellers and all transit links are subject to feedback discussion and a source of inspiration for other 
    travellers like you!
  `;

  let singleText = findText;
  if (selection === 'contribute') {
    singleText = contributeText;
  } else if (selection === 'share') {
    singleText = shareText;
  }

	return (
    <div className={s.container}>
      <div className={s.brand}>
        <div className={s.appName}>Transitlinks</div>
        <div className={s.appShortDescription}>Universal transit resource</div>
      </div>
      <div className={s.about}>Find transit connections anywhere in the world by any mode of transport.</div>
      <div className={s.breakdown}>
        <div className={s.items}>
          <div className={cx(s.item, s.find, selection === 'find' ? s.selected : s.unselected)}>
            <div className={s.header} onClick={() => select('find')}>
              <div className={s.title}>
                <span>Find</span>
              </div>
            </div>
            <div className={s.body}>
              <div className={s.content}>
                {findText}
              </div>
            </div>
          </div>
          <div className={cx(s.item, selection === 'contribute' ? s.selected : s.unselected)}>
            <div className={s.header} onClick={() => select('contribute')}>
              <div className={s.title}>
                <span>Contribute</span>
              </div>
            </div>
            <div className={s.body}>
              <div className={s.content}>
                {contributeText}
              </div>
            </div>
          </div>
          <div className={cx(s.item, selection === 'share' ? s.selected : s.unselected)}>
            <div className={s.header} onClick={() => select('share')}>
              <div className={s.title}>
                <span>Share</span>
              </div>
            </div>
            <div className={s.body}>
              <div className={s.content}>
                {shareText}
              </div>
            </div>
          </div>
        </div>
        <div className={s.singleText}>
          {singleText}
        </div>
      </div>
    </div>
  );

}; 

HomeView.contextTypes = { setTitle: PropTypes.func.isRequired };

export default injectIntl(
  connect(state => ({
    breakdownSelected: state.home.breakdownSelected
  }), {
    setProperty
  })(withStyles(s)(HomeView))
);
