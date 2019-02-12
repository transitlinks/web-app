import React from 'react';
import { defineMessages } from 'react-intl';

export default defineMessages({
  'email': {
    id: 'account.profile.email',
    defaultMessage: 'E-mail',
    description: 'E-mail'
  },
  'photo': {
    id: 'account.profile.photo',
    defaultMessage: 'User photo',
    description: 'User photo'
  },
  'reset-password': {
    id: 'account.profile.resetPwd',
    defaultMessage: 'New password',
    description: 'New password'
  },
  'confirm-reset': {
    id: 'account.profile.confirmResetPwd',
    defaultMessage: 'CHANGE',
    description: 'Change'
  },
  'reset-password-error': {
    id: 'account.profile.resetPwdError',
    defaultMessage: 'Error! Failed saving new password :( ',
    description: 'There was an error saving password'
  },
  'reset-password-success': {
    id: 'account.profile.resetPwdSuccess',
    defaultMessage: 'Password changed',
    description: 'Password changed'
  },
  'save-profile': {
    id: 'account.profile.saveProfile',
    defaultMessage: 'Save',
    description: 'Save'
  },
  'save-profile-error': {
    id: 'account.profile.saveProfileError',
    defaultMessage: 'Error! Failed saving profile :(',
    description: 'There was an error saving profile'
  },
  'save-profile-success': {
    id: 'account.profile.saveProfileSuccess',
    defaultMessage: 'Profile saved',
    description: 'Profile saved'
  }
});
