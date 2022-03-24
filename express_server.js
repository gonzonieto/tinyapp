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

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  "r7ri45": {
    id: "r7ri45",
    email: "test@test.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
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
  res.render('register_new_user');
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
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
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    user: users[userID]
  };
  res.render('urls_show', templateVars);
});

// POST
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Check if email or password are empty strings and return an error
  //TODO: Refactor function that checks if email/pw are blank -- newUserHasBlankFields()
  if ([email, password].includes('')) {
    res.status(400).send('Email and password fields cannot be blank.');
  }

  //Generate an array of user emails and checking against it to see if email is already in use
  //TODO: Refactor function that checks if email is in use -- newEmailAlreadyUsed()
  const userEmails = Object.values(users).map((user) => user['email']);
  if (userEmails.includes(email)) {
    res.status(400).send(`That email is already in use. Please use another email.`);
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  res.cookie('user_id', email);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyAPP app listening on port ${PORT}!`);
});