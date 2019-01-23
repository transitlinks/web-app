import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Add.css';
import AddView from '../../components/Add';
import Place from '../../components/Add/Place';
import Link from '../../components/Add/Link';

const title = 'Transitlinks - Add';

class Add extends React.Component {

  render() {

    const { context, props } = this;

    context.setTitle(title);

    const errorElem = null;

    let content = null;
    let typeName = null;
    if (props.place) {
      typeName = 'place';
      content = (
        <Place place={props.profile} />
      );
    } else if (props.link) {
      typeName = 'link';
      content = (
        <Link link={props.userLinks} />
      );
    }

    return (

      <div>
        <div className={s.root}>
          <div className={s.container}>
            <AddView type={typeName}>
              {content}
            </AddView>
          </div>
        </div>
      </div>

    );

  }

};

Add.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Add);
