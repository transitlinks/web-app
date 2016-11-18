import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { navigate } from '../../actions/route';

const isLeftClickEvent = (event) => {
  return event.button === 0;
}

const isModifiedEvent = (event) => {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

const Link = ({
  className,
  to, navigate,
  children
}, context) => {

  const handleClick = (event) => {
    
    let allowTransition = true;

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
      return;
    }

    if (event.defaultPrevented === true) {
      allowTransition = false;
    }

    event.preventDefault();

    if (allowTransition) {
      if (to) {
        navigate(to);
      } else {
        navigate({
          pathname: event.currentTarget.pathname,
          search: event.currentTarget.search
        });
      }
    }
  
  };
  
  return (
    <a href={context.createHref(to)} className={className} onClick={handleClick}>
      {children}
    </a>
  );

}

Link.propTypes = {  
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
};

Link.contextTypes = {
  createHref: PropTypes.func.isRequired
};

export default connect(state => ({
}), {
  navigate
})(Link);
