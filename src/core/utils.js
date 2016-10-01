export function emailValid(email) {

  if (!email) {
    return {
      text: "Sähköposti",
      style: {}
    }
  }

  const at = email.indexOf("@");
  
  if (at === -1) {
    return {
      text: "@ merkki puuttuu",
      style: { color: "orange" }
    };
  }
   
  if (at === 0) {
    return {
      text: "Etumääre puuttuu",
      style: { color: "orange" }
    };
  }
  
  const domain = email.substring(at + 1);
  
  if (domain.indexOf("@") !== -1) {
    return {
      text: "Liikaa @ merkkejä",
      style: { color: "orange" }
    };
  }
  
  if (domain === "") {
    return {
      text: "Verkkotunnus puuttuu",
      style: { color: "orange" }
    }; 
  }
  
  const dot = domain.indexOf(".");

  if (dot === -1) {
    return {
      text: "Loppumääre puuttuu",
      style: { color: "orange" }
    }; 
  }
  
  if (domain.substring(dot + 1).length < 2) {
    return {
      text: "Loppumääre liian lyhyt",
      style: { color: "orange" }
    }; 
  }

  return {
    text: "Sähköposti",
    style: { color: "green" },
    pass: true
  };

}
  
export function passwordValid(password) {
  
  if (!password) {
    return {
      text: "Salasana",
      style: {}
    }
  }
  
  if (password.length < 4) {
    return {
      text: "Vähintään 4 merkkiä",
      style: { color: "orange" }
    };
  }

  return {
    text: "Salasana",
    style: { color: "green" },
    pass: true
  };
  
  return "Salasana";

}
