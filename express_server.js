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

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies['username']
  };
  
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  console.log(req.body);
  const username  = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}!`);
});