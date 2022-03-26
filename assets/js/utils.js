export function getAccounts() {
  /* Get the list of user accounts from localStorage. */

  if (!localStorage.accounts) {
    localStorage.setItem('accounts', JSON.stringify([]));
  }

  return JSON.parse(localStorage.getItem('accounts'));
}


export function getAccountByEmail(email) {
  /* Return user account registered with the given email, or return
  null if no such account exists. */

  let accounts = getAccounts();
  for (let account of accounts) {
    if (account.email === email) {
      return account;
    }
  }

  return null;
}


export function createAccount(email, firstName, lastName, password) {
  /* Create a new account, if the email is not already associated to
  an existing account. */

  let accounts = getAccounts();
  for (let account of accounts) {
    if (account.email === email) {
      return false;
    }
  }

  let new_account = {
    email: email,
    firstName: firstName,
    lastName: lastName,
    password: password
  }

  accounts.push(new_account);
  localStorage.setItem('accounts', JSON.stringify(accounts));

  return true;
}


export function addStatusMessage(alertType, paragraphs) {
  /* Add status message to the top of the page. */
  
  let statusMessages = document.getElementById('status-messages');
  
  let statusMessage = document.createElement('div');
  statusMessage.classList.add('alert', alertType);
  
  let closeButton = document.createElement('span');
  closeButton.innerHTML = '&#x2715;'
  closeButton.classList.add('close');
  closeButton.setAttribute('aria-label', 'Cerrar esta alerta');
  
  
  statusMessage.appendChild(closeButton);
  
  for (let text of paragraphs) {
    let paragraph = document.createElement('p');
    paragraph.textContent = text;
    
    statusMessage.appendChild(paragraph);
  }
  
  statusMessages.prepend(statusMessage);
  
  closeButton.addEventListener('click', function (event) {
    this.parentElement.remove();
  });
}


export async function getTrainingSessionsJSON() {
  /* Request training sessions JSON file and return data object. */
  
  const requestURL = '/data/training-sessions.json';
  const request = new Request(requestURL);
  
  const response = await fetch(request);
  const trainingSessions = await response.json();
  
  return trainingSessions;
}
