import React from 'react';
import { FormattedMessage } from 'react-intl';

export const getMessages = (source) => {
  
  let messages = {};
  Object.keys(source).forEach(name => {
    messages[name] = <FormattedMessage {...source[name]} />;
  });
  
  return messages;

};

export const formatDate = (value, format) => {
  
  const date = new Date(value);

  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

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

export const extractLinkAreas = (link) => {
  
  const fromCommaIndex = link.from.description.indexOf(',');
  const fromCity = link.from.description.substring(0, fromCommaIndex);
  const fromArea = link.from.description.substring(fromCommaIndex + 1);
  
  const toCommaIndex = link.to.description.indexOf(',');
  const toCity = link.to.description.substring(0, toCommaIndex);
  const toArea = link.to.description.substring(toCommaIndex + 1);

  return { fromCity, fromArea, toCity, toArea };

};

export const truncate = (value, maxLength) => {
  
  if (!value) return null;

  const strValue = '' + value;

  if (strValue.length > maxLength) {
    return strValue.substring(0, maxLength);
  }

  return strValue;

};

