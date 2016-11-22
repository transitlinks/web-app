import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Account.css';
import AccountView from '../../components/Account';
import Profile from '../../components/Account/Profile';
import UserLinks from '../../components/Account/UserLinks';

const title = 'Transitlinks - Account';

const Account = (props, context) => {
  
  context.setTitle(title);
  
  const errorElem = null;
  
  let section = null;
  if (props.profile) {
    section = (
      <Profile profile={props.profile} />
    );
  } else if (props.links) {
    section = (
      <UserLinks links={props.links} />
    );
  }

  return (
    
    <div>
      <div className={s.root}>
        <div className={s.container}>
          <AccountView>
            {section}
          </AccountView>
        </div>
      </div>
    </div>    
  
  );

};

Account.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Account);
