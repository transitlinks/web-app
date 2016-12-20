import React from 'react';
import { FormattedMessage } from 'react-intl';

export const getMessages = (source) => {
  
  let messages = {};
  Object.keys(source).forEach(name => {
    messages[name] = <FormattedMessage {...source[name]} />;
  });
  
  return messages;

};

export const formatDuration = (totalMinutes) => {

  if (!totalMinutes) {
    return null;
  }

  const minutes = totalMinutes % 60;
  const hours = (totalMinutes - minutes) / 60;

  let formatted =  '';
  
  if (hours > 0) {
    formatted += `${hours}h `; 
  }

  if (minutes > 0) {
    formatted += `${minutes}m`;
  }
  
  return formatted;

};
