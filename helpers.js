const bcrypt = require('bcryptjs');

const getUserIDFromEmail = (email, users) => {
  const user = Object.values(users).find((item) => item.email === email);
  return user === undefined ? undefined : user.id;
};

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

const addNewUser = (email, password, users) => {
  const id = generateRandomString();
  users[id] = { id, email, password };
  return id;
};

const addNewURL = (longURL, userID, urlDatabase, creationDate) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID, creationDate };
  return shortURL;
};

const shortUrlExists = (shortURL, urlDatabase) => {
  return urlDatabase[shortURL] === undefined ? false : true;
};

const newEmailAlreadyUsed = (email, users) => {
  const userEmails = Object.values(users).map((user) => user['email']);
  return userEmails.includes(email);
};

const newUserHasBlankFields = (email, password) => [email, password].includes('');

const isLoggedIn = (userID, users) => {
  const userIDs = Object.keys(users);
  if (userID === undefined || !userIDs.includes(userID)) {
    return false;
  }
  return true;
};

const passwordIsCorrect = (id, loginPassword, users) => {
  const hashedPassword = users[id].password;
  return bcrypt.compareSync(loginPassword, hashedPassword);
};

const urlsByUser = (userID, urlDatabase) => {
  const urls = Object.entries(urlDatabase)
    .filter(x => x[1].userID === userID);
  return urls;
};

const userOwnsUrl = (userID, shortURL, urlDatabase) => {
  const urls = urlsByUser(userID, urlDatabase).map(x => x[0]);
  return urls.includes(shortURL);
};

module.exports = {
  getUserIDFromEmail,
  addNewUser,
  addNewURL,
  shortUrlExists,
  newEmailAlreadyUsed,
  newUserHasBlankFields,
  isLoggedIn,
  passwordIsCorrect,
  urlsByUser,
  userOwnsUrl
};