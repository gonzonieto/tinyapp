const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');

//Including helper functions
const {
  getUserIDFromEmail,
  addNewUser,
  addNewURL,
  shortUrlExists,
  incrementViews,
  newEmailAlreadyUsed,
  newUserHasBlankFields,
  isLoggedIn,
  passwordIsCorrect,
  urlsByUser,
  userOwnsUrl,
  logUser
} = require('./helpers');

const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['cookieKey1', 'cookieKey2', 'cookieKey3']
}));
app.use(express.static(__dirname));

process.on(('SIGTERM'), () => {
  fs.writeFileSync(__dirname + '/src/userDatabase.txt', JSON.stringify(users));
  console.log('SIGTERM signal received: Saving files and closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

process.on(('SIGINT'), () => {
  fs.writeFileSync(__dirname + '/src/urlDatabase.txt', JSON.stringify(urlDatabase));
  console.log('SIGINT signal received: Saving files and closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

const urlDatabase = JSON.parse(fs.readFileSync(__dirname + '/src/urlDatabase.txt', 'utf8'));

const users = JSON.parse(fs.readFileSync(__dirname + '/src/userDatabase.txt', 'utf8'));

// GET
app.get('/', (req, res) => {
  isLoggedIn(req.session.userID, users)
    ? res.redirect('/urls')
    : res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (isLoggedIn(req.session.userID, users)) {
    res.redirect('/urls');
    return;
  }
  res.render('login');
});

app.get('/register', (req, res) => {
  if (isLoggedIn(req.session.userID, users)) {
    res.redirect('/urls');
    return;
  }
  res.render('register_new_user');
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!(shortUrlExists(shortURL, urlDatabase))) {
    const errorInfo = { errorCode:'404 NOT FOUND', errorMsg:'Must be logged in to access this page.' };
    res.status(404).render('error', errorInfo);
    return;
  }

  incrementViews(shortURL, urlDatabase);

  const userID = req.session.userID;
  if (isLoggedIn(req.session.userID, users)) {
    logUser(userID, shortURL, urlDatabase);
  }
  
  const longURL = urlDatabase[shortURL].longURL;
  console.log(urlDatabase);
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  if (!isLoggedIn(userID, users)) {
    const errorInfo = { errorCode:'403 FORBIDDEN', errorMsg:'Must be logged in to access this page.' };
    res.status(403).render('error', errorInfo);
    return;
  }

  const templateVars = {
    urls: urlsByUser(userID, urlDatabase),
    user: users[userID]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.userID;
  const templateVars = {
    user: users[userID]
  };
  if (!isLoggedIn(req.session.userID, users)) {
    res.redirect('/login');
    return;
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  if (!shortUrlExists(shortURL, urlDatabase)) {
    const errorInfo = { errorCode:'404 NOT FOUND', errorMsg:`${shortURL} does not exist. Nice try, hacker!` };
    res.status(403).render('error', errorInfo);
    return;
  }
  if (!isLoggedIn(userID, users)) {
    const errorInfo = { errorCode:'403 FORBIDDEN', errorMsg:'Must be logged in to access this page.' };
    res.status(403).render('error', errorInfo);
    return;
  }

  if (!userOwnsUrl(userID, shortURL, urlDatabase)) {
    const errorInfo = { errorCode:'403 FORBIDDEN', errorMsg:'Must own this TinyURL to view the page.' };
    res.status(403).render('error', errorInfo);
    return;
  }
  const templateVars = {
    shortURL,
    visits: urlDatabase[shortURL].visits,
    creationDate: urlDatabase[shortURL].creationDate,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userID]
  };
  res.render('urls_show', templateVars);
});

// POST
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (newUserHasBlankFields(email, password) || newEmailAlreadyUsed(email, users)) {
    const errorInfo = { errorNum: 400, errorCode:'400 BAD REQUEST', errorMsg:'Invalid account creation details.' };
    res.status(errorInfo.errorNum).render('error', errorInfo);
    return;
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = addNewUser(email, hashedPassword, users);
  req.session.userID = id;
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const userID = req.session.userID;
  if (!isLoggedIn(userID, users)) {
    const errorInfo = { errorNum: 401, errorCode:'401 UNAUTHORIZED', errorMsg:'Must be logged in to perform this action! Please log in and try again.' };
    res.status(errorInfo.errorNum).render('error', errorInfo);
    return;
  }

  if (!userOwnsUrl(userID, shortURL, urlDatabase)) {
    const errorInfo = { errorNum: 401, errorCode:'401 UNAUTHORIZED', errorMsg:'Must own this resource to edit it.' };
    res.status(errorInfo.errorNum).render('error', errorInfo);
    return;
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].creationDate = new Date().toLocaleDateString("default", { year: 'numeric', month: 'long', day: 'numeric' });
  res.redirect('/urls/');
});

app.post('/urls', (req, res) => {
  const userID = req.session.userID;
  if (!isLoggedIn(userID, users)) {
    const errorInfo = { errorNum: 401, errorCode:'401 UNAUTHORIZED', errorMsg:'Must be logged in to perform this action! Please log in and try again.' };
    res.status(errorInfo.errorNum).render('error', errorInfo);
    return;
  }
  const date = new Date().toLocaleDateString("default", { year: 'numeric', month: 'long', day: 'numeric' });
  const shortURL = addNewURL(req.body.longURL, userID, urlDatabase, date);
  res.redirect('/urls/' + shortURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const userID = req.session.userID;
  if (!isLoggedIn(userID, users)) {
    const errorInfo = { errorNum: 401, errorCode:'401 UNAUTHORIZED', errorMsg:'Must be logged in to perform this action!' };
    res.status(errorInfo.errorNum).render('error', errorInfo);
    return;
  }

  if (!userOwnsUrl(userID, shortURL, urlDatabase)) {
    const errorInfo = { errorNum: 401, errorCode:'401 UNAUTHORIZED', errorMsg:'Must own this resource to edit it.' };
    res.status(errorInfo.errorNum).render('error', errorInfo);
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const id = getUserIDFromEmail(email, users);
  if (id === undefined || !passwordIsCorrect(id, password, users)) {
    const errorInfo = { errorNum: 403, errorCode:'403 FORBIDDEN', errorMsg:'Login attempt failed.' };
    res.status(errorInfo.errorNum).render('error', errorInfo);
    return;
  }
  req.session.userID = id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyAPP app listening on port ${PORT}!`);
});