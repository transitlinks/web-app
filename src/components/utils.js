import React from 'react';
import { FormattedMessage } from 'react-intl';

export const getMessages = (source) => {
  
  let messages = {};
  Object.keys(source).forEach(name => {
    messages[name] = <FormattedMessage {...source[name]} />;
  });
  
  return messages;

};
