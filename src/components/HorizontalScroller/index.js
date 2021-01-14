import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setProperty } from '../../actions/properties';
import s from './HorizontalScroller.css';

import { injectIntl } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';
import { isMobile } from '../utils';

class HorizontalScroller extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (!this.state.ref) {
      this.setState({ ref: this.ref });
    }
  }

  componentWillUnmount() {
  }


  render() {

    let offsetWidth = 0;
    let scrollWidth = 0;
    let scrollLeft = 2;

    const { content, rtl } = this.props;
    const { ref } = this.state;

    if (ref) {
      offsetWidth = ref.offsetWidth;
      scrollWidth = ref.scrollWidth;
      scrollLeft = this.state.scrollLeft || ref.scrollLeft;
    }

    const rtlLeftOverflow = offsetWidth !== scrollWidth && (offsetWidth - scrollWidth) + 2 <= scrollLeft;
    const rtlRightOverflow = scrollLeft < 0;


    const leftOverflow = offsetWidth !== scrollWidth && (offsetWidth - scrollWidth) + 2 <= -scrollLeft;
    const rightOverflow = scrollLeft > 0;

    return (
      <div className={s.contentScrollerContainer}>
        <div className={s.contentScroller} ref={(ref) => this.ref = ref} style={rtl ? { direction: 'rtl' } : {}}>
          {content}
        </div>
        {
          ref && !isMobile() && (rtl ? rtlLeftOverflow : leftOverflow) &&
            <div className={s.scrollArrow} style={rtl ? { left: '0px' } : { right: '0px' }} onClick={() => {
              if (ref) {
                const left = rtl ? ref.scrollLeft - 200 : ref.scrollLeft + 200;
                console.log('scroll left', ref.scrollLeft, left);
                ref.scrollTo({ left, top: 0, behavior: 'smooth' });
                setTimeout(() => this.setState({ scrollLeft: left }), 400);
              }
            }}>
              <FontIcon className="material-icons"
                        style={{ fontSize: '22px' }}>{ rtl ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }</FontIcon>
            </div>
        }
        {
          ref && !isMobile() && (rtl ? rtlRightOverflow : rightOverflow) &&
            <div className={s.scrollArrow} style={rtl ? { right: '0px' } : { left: '0px' }} onClick={() => {
              if (ref) {
                const left = rtl ? ref.scrollLeft + 200 : ref.scrollLeft - 200;
                ref.scrollTo({ left, top: 0, behavior: 'smooth' });
                setTimeout(() => this.setState({ scrollLeft: left }), 400);
              }
            }}>
              <FontIcon className="material-icons"
                        style={{ fontSize: '22px' }}>{ rtl ? 'keyboard_arrow_right' : 'keyboard_arrow_left' }</FontIcon>
            </div>
        }
      </div>
    );
  }


};

export default injectIntl(
  connect(state => ({
  }), {
    setProperty
  })(withStyles(s)(HorizontalScroller))
);
