const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const generateRandomString = require('./generateRandomString');
const cookieParser = require('cookie-parser')

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// variables
let urlDatabase = {
  'b2xVn2': 'http://lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com',
};

// get requests
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls/newURL', (req, res) => {
  let longURL = req.body.longURL;
  let shortURL;
  do {
    shortURL = generateRandomString();
  }
  while (urlDatabase[shortURL]);
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get('/hello', (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render('hello_world', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// post requests

app.post('/urls/:id/delete', (req, res) => {
  let deleteURL = req.params.id;
  delete urlDatabase[deleteURL];
  res.redirect('/');
});

app.post('/urls/:id/update', (req, res) => {
  let updateURL = req.params.id;
  urlDatabase[updateURL] = req.body.newurl;
  res.redirect('/urls');
});


app.get('/urls/:id', (req, res) => {
  let shortURL;
  for (url in urlDatabase) {
    if (url == req.params.id) {
      shortURL = url;
    }
  }
  templateVars = {
    url: shortURL,
    username: req.cookies['username'],
  };
  res.render('urls_show', templateVars);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
  console.log(req.body.username);
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
