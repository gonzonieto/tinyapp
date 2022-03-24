const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

// body parsing middleware from Express JS
// http://expressjs.com/en/resources/middleware/body-parser.html
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// cookie parsing middleware from Express JS
// http://expressjs.com/en/resources/middleware/cookie-parser.html
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

const getUserIDFromEmail = (email) => {
  const user = Object.values(users).find((item) => item.email === email);
  return user === undefined ? undefined : user.id;
};

const addNewUser = (email, password) => {
  const id = generateRandomString();
  users[id] = { id, email, password };
  return id;
};

const addNewURL = (longURL, userID) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  return shortURL;
};

const shortUrlExists = (shortURL) => {
  return urlDatabase[shortURL] === undefined
    ? false
    : true;
};

const newEmailAlreadyUsed = (email) => {
  const userEmails = Object.values(users).map((user) => user['email']);
  return userEmails.includes(email);
};

const newUserHasBlankFields = (email, password) => [email, password].includes('');

const isLoggedIn = (userID) => {
  //get an array of valid user IDs
  const userIDs = Object.keys(users);
  if (userID === undefined || !userIDs.includes(userID)) {
    return false;
  }
  return true;
};

const passwordIsCorrect = (id, password) => {
  const user = users[id];
  return user.password === password;
};

const urlsByUser = (userID) => {
  const urls = Object.entries(urlDatabase)
    .filter(x => x[1].userID === userID);
  return urls;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.implicitaudio.ca',
    userID: 'yu0p44'
  },
  i3BoGr: {
    longURL: 'https://www.shopify.com',
    userID: 'aJ48lW'
  },
  y4tjj1: {
    longURL: 'https://www.guitarcabinets.ca',
    userID: 'yu0p44'
  }
};

const users = {
  'aJ48lW': {
    id: 'aJ48lW',
    email: 'test@test.com',
    password: 'purple-monkey-dinosaur'
  },
  'yu0p44': {
    id: 'yu0p44',
    email: 'g@nzo.com',
    password: 'gg'
  },
  'eez212': {
    id: 'eez212',
    email: 'hi@implicitaudio.ca',
    password: 'nice'
  }
};

// GET
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  if (isLoggedIn(req.cookies['user_id'])) {
    res.redirect('/urls');
    return;
  }
  res.render('register_new_user');
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!(shortUrlExists(shortURL))) {
    res.status(404).send('404 NOT FOUND');
    return;
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  if (!isLoggedIn(userID)) {
    res.status(403).send('404 FORBIDDEN');
    return;
  }

  const templateVars = {
    urls: urlsByUser(userID),
    user: users[userID]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    user: users[userID]
  };
  if (!isLoggedIn(req.cookies['user_id'])) {
    res.redirect('/login');
    return;
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  if (!(shortUrlExists(shortURL))) {
    res.status(404).send('404 NOT FOUND');
    return;
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userID]
  };
  res.render('urls_show', templateVars);
});

// POST
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (newUserHasBlankFields(email, password) || newEmailAlreadyUsed(email)) {
    res.status(400).send('400 BAD REQUEST');
    return;
  }

  const id = addNewUser(email, password);
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.post('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  if (!isLoggedIn(userID)) {
    res.status(401).send('401 UNAUTHORIZED');
    return;
  }
  const shortURL = addNewURL(req.body.longURL, userID);
  console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const id = getUserIDFromEmail(email);
  if (id === undefined || !passwordIsCorrect(id, password)) {
    res.status(403).send(`403 FORBIDDEN`);
    return;
  }
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyAPP app listening on port ${PORT}!`);
});