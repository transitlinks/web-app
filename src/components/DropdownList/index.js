import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setProperty } from '../../actions/properties';
import s from './DropdownList.css';
import Link from '../Link';

import { injectIntl } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';

class DropdownList extends React.Component {

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  handleClick(event) {

    if (this.node) {
      if (this.node.contains(event.target)) {
        return;
      }
      this.props.setProperty(this.props.optionsRef, null);
    }

  }

  render() {

    const { options, onSelect } = this.props;

    if (!options) return null;

    return (
      <div ref={node => this.node = node} className={s.container}>
        {
          options.length === 0 ?
            <div className={s.notFound}>
              Not found
            </div> :
            options.map(option => (
              <div className={s.option} onClick={() => onSelect(option)}>{option.label}</div>
            ))
        }
      </div>
    );
  }


};

export default injectIntl(
  connect(state => ({
  }), {
    setProperty
  })(withStyles(s)(DropdownList))
);
