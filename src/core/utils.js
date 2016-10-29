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
