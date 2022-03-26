export function getQueryParams() {
  /* Get the current page's query parameters. */

  return new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
}


export function setQueryParams(data) {
  /* Set the current page's query parameters. */

  let params = new URLSearchParams(data);
  window.location.search = params.toString();
}


export function getAccounts() {
  /* Get the list of user accounts from localStorage. */

  if (!localStorage.accounts) {
    localStorage.setItem('accounts', JSON.stringify([]));
  }

  return JSON.parse(localStorage.getItem('accounts'));
}


export function getAccountByEmail(email) {
  /* Return user account registered with the given email, or return
  undefined if no such account exists. */

  return getAccounts().find(account => account.email === email);
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


export function getSignedInAccount() {
  /* Return the data of the currently signed-in account, or null if the
  user is not signed in. */

  return JSON.parse(sessionStorage.getItem('account'));
}


export function setUpSignedInHeader(account) {
  /* Remove sign-in nav link in header, add div with the account's 
  name and a sign-out button. */

  let headerNavContainer = document.querySelector('header nav .container');

  let navLinks = headerNavContainer.querySelectorAll('ul > li');
  navLinks[navLinks.length - 1].remove();

  let accountDiv = document.createElement('div');
  accountDiv.classList.add('account');

  let fullName = document.createElement('span');
  fullName.textContent = account.firstName + " " + account.lastName;

  let signOut = document.createElement('button');
  signOut.type = 'button';
  signOut.id = 'sign-out-btn';
  signOut.textContent = 'Salir';

  signOut.addEventListener('click', function (event) {
    sessionStorage.clear();
    window.location.assign('/');
  });

  accountDiv.appendChild(fullName);
  accountDiv.appendChild(signOut);

  headerNavContainer.appendChild(accountDiv);
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
