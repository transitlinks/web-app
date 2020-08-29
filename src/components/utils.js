import React from 'react';
import { FormattedMessage } from 'react-intl';

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const getMonthName = (date) => {
  return MONTHS[date.getMonth()];
};

export function padNumber(number) {

  if (number < 10) {
    return '0' + number;
  }

  return number;

}

export const getMessages = (source) => {

  let messages = {};
  Object.keys(source).forEach(name => {
    messages[name] = <FormattedMessage {...source[name]} />;
  });

  return messages;

};

export const getDateString = (value) => {

  const date = new Date(value);

  return date.getFullYear() + '-' + padNumber(date.getMonth() + 1) + '-' + date.getDate();

};

export const getTimeString = (value) => {

  const date = new Date(value);

  return padNumber(date.getHours()) + ':' + padNumber(date.getMinutes());

};

export const formatDate = (value, format) => {

  const date = new Date(value);

  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

};

export const getLocalDateTimeValue = (localDateTime) => {
  const date = localDateTime.substring(0, 10);
  const year = date.substring(0, 4);
  const month = date.substring(5, 7);
  const day = date.substring(8, 10);
  const time = localDateTime.substring(11, 16);
  const hours = time.substring(0, 2);
  const minutes = time.substring(3, 5);
  const localDate = new Date();
  localDate.setFullYear(parseInt(year));
  localDate.setMonth(parseInt(month) - 1);
  localDate.setDate(parseInt(day));
  localDate.setHours(parseInt(hours));
  localDate.setMinutes((parseInt(minutes)));
  return localDate;
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

export const getCookie = (cname) => {

  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');

  for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }

  return null;

}

export const getScreenWidth = () => {
  const w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0];
  return w.innerWidth || e.clientWidth || g.clientWidth;
};

export const getNavigationPath = (params) => {

  const path = {
    pathname: params.path || '/links'
  };

  const paramKeys = Object.keys(params);

  const paramsList = paramKeys.filter(key => key !== 'path' && params[key])
    .map(key => `${key}=${Array.isArray(params[key]) ? params[key].join(',') : params[key]}`);

  if (paramsList.length > 0) {
    path.search = `?${paramsList.join('&')}`;
  }

  return path;

};

export const getNavigationQuery = (params) => {
  const path = getNavigationPath(params);
  return path.pathname + (path.search || '');
};
