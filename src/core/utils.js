const uuid = require('uuid/v1');

export const toGraphQLObject = (object) => {
  const json = JSON.stringify(object);
  json.replace(/\\"/g,"\uFFFF"); //U+ FFFF
  return json.replace(/\"([^"]+)\":/g,"$1:").replace(/\uFFFF/g,"\\\"");
};

export function emailValid(email) {

  if (!email) {
    return {
      text: 'email',
      style: {}
    }
  }

  const at = email.indexOf('@');

  if (at === -1) {
    return {
      text: 'missing-at',
      style: { color: 'orange' }
    };
  }

  if (at === 0) {
    return {
      text: 'missing-prefix',
      style: { color: 'orange' }
    };
  }

  const domain = email.substring(at + 1);

  if (domain.indexOf('@') !== -1) {
    return {
      text: 'too-many-ats',
      style: { color: 'orange' }
    };
  }

  if (domain === '') {
    return {
      text: 'missing-domain',
      style: { color: 'orange' }
    };
  }

  const dot = domain.indexOf('.');

  if (dot === -1) {
    return {
      text: 'missing-postfix',
      style: { color: 'orange' }
    };
  }

  if (domain.substring(dot + 1).length < 2) {
    return {
      text: 'postfix-too-short',
      style: { color: 'orange' }
    };
  }

  return {
    text: 'email',
    style: { color: 'green' },
    pass: true
  };

}

export function passwordValid(password) {

  if (!password) {
    return {
      text: 'password',
      style: {}
    }
  }

  if (password.length < 4) {
    return {
      text: 'password-too-short',
      style: { color: 'orange' }
    };
  }

  return {
    text: 'password',
    style: { color: 'green' },
    pass: true
  };


}

export function getClientId() {


  let clientId = localStorage.getItem('txlinksClientId');
  if (!clientId) {
    clientId = uuid();
    localStorage.setItem('txlinksClientId', clientId);
  }

  return clientId;

}

export function createParamString(params) {

  let paramsString = '';

  const paramKeys = Object.keys(params);
  paramKeys.forEach(key => {
    if (params[key]) {
      let val = isNaN(params[key]) ? `"${params[key]}"` : params[key];
      if (Array.isArray(params[key])) val = `[${params[key].map(p => `"${p}"`).join(',')}]`;
      else if (isNaN(params[key]) && params[key].indexOf(',') !== -1) val = `[${params[key].split(',').map(p => `"${p}"`).join(',')}]`;
      paramsString += `, ${key}: ${val}`;
    }
  });

  if (paramsString.length > 0) {
    paramsString = '(' + paramsString + ')';
  }

  return paramsString;

}
