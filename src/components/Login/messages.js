import React from 'react';
import { defineMessages } from 'react-intl';

export default defineMessages({
  'login-info': {
    id: 'login.loginInfo',
    defaultMessage: 'Sign in using any of the methods below. In case you haven\'t signed in before, your account will be created at your first login.',
    description: 'Login info'
  },
  'terms-text': {
    id: 'login.termsText',
    defaultMessage: 'By signing you are accepting our',
    description: 'Terms text'
  },
  'terms-link': {
    id: 'login.termsLink',
    defaultMessage: 'service agreement',
    description: 'service agreement'
  },
  'facebook': {
    id: 'login.facebook',
    defaultMessage: 'Sign in with Facebook',
    description: 'Sign in with Facebook'
  },
  'google': {
    id: 'login.google',
    defaultMessage: 'Sign in with Google',
    description: 'Sign in with Google'
  },
  'local': {
    id: 'login.local',
    defaultMessage: 'Sign in with e-mail and password',
    description: 'Sign in with e-mail and password'
  },
  'reset-password': {
    id: 'login.reset-password',
    defaultMessage: 'Reset password',
    description: 'Reset password'
  },
  'sign-in': {
    id: 'login.signIn',
    defaultMessage: 'Sign in',
    description: 'Sign in'
  },
  'email': {
    id: 'login.emailLabel',
    defaultMessage: 'E-mail',
    description: 'E-mail'
  },
  'missing-at': {
    id: 'login.missingAt',
    defaultMessage: '@ symbol is missing',
    description: '@ symbol is missing'
  },
  'missing-prefix': {
    id: 'login.missingPrefix',
    defaultMessage: 'E-mail prefix is missing',
    description: 'E-mail prefix is missing'
  },
  'too-many-ats': {
    id: 'login.tooManyAts',
    defaultMessage: 'Too many @ symbols',
    description: 'Too many @ symbols'
  },
  'missing-domain': {
    id: 'login.missingDomain',
    defaultMessage: 'Domain name is missing',
    description: 'Domain name is missing'
  },
  'missing-postfix': {
    id: 'login.missingPostfix',
    defaultMessage: 'Domain postfix is missing',
    description: 'Domain postfix is missing'
  },
  'postfix-too-short': {
    id: 'login.postfixTooShort',
    defaultMessage: 'Domain postfix too short',
    description: 'Domain postfix too short'
  },
  'password': {
    id: 'login.passwordLabel',
    defaultMessage: 'Password',
    description: 'Password'
  },
  'password-too-short': {
    id: 'login.passwordTooShort',
    defaultMessage: 'At least 4 characters',
    description: 'At least 4 characters'
  }
});
