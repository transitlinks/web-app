import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Account.css';
import AccountView from '../../components/Account';
import Profile from '../../components/Account/Profile';
import UserLinks from '../../components/Account/UserLinks';

const title = 'Transitlinks - Account';

class Account extends React.Component {

  render() {  

    const { context, props } = this;

    context.setTitle(title);

    const errorElem = null;
  
    let section = null;
    let sectionName = null;
    if (props.profile) {
      sectionName = 'profile';
      section = (
        <Profile profile={props.profile} />
      );
    } else if (props.userLinks) {
      sectionName = 'links';
      section = (
        <UserLinks userLinks={props.userLinks} />
      );
    }

    return (
      
      <div>
        <div className={s.root}>
          <div className={s.container}>
            <AccountView section={sectionName}>
              {section}
            </AccountView>
          </div>
        </div>
      </div>    
    
    );

  }

};

Account.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Account);
