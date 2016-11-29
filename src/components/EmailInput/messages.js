import React from 'react';
import { defineMessages } from 'react-intl';

export default defineMessages({
  'email': {
    id: 'email.emailLabel',
    defaultMessage: 'E-mail',
    description: 'E-mail'
  },
  'missing-at': {
    id: 'email.missingAt',
    defaultMessage: '@ symbol is missing',
    description: '@ symbol is missing'
  },
  'missing-prefix': {
    id: 'email.missingPrefix',
    defaultMessage: 'E-mail prefix is missing',
    description: 'E-mail prefix is missing'
  },
  'too-many-ats': {
    id: 'email.tooManyAts',
    defaultMessage: 'Too many @ symbols',
    description: 'Too many @ symbols'
  },
  'missing-domain': {
    id: 'email.missingDomain',
    defaultMessage: 'Domain name is missing',
    description: 'Domain name is missing'
  },
  'missing-postfix': {
    id: 'email.missingPostfix',
    defaultMessage: 'Domain postfix is missing',
    description: 'Domain postfix is missing'
  },
  'postfix-too-short': {
    id: 'email.postfixTooShort',
    defaultMessage: 'Domain postfix too short',
    description: 'Domain postfix too short'
  }
});
