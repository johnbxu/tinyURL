const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const generateRandomString = require('./generateRandomString');

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

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_new', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/:id', (req, res) => {
  let shortURL;
  for (url in urlDatabase) {
    if (url == req.params.id) {
      shortURL = url;
    }
  }
  templateVars = {url: shortURL};
  res.render('urls_show', templateVars);
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

app.post('/urls/new', (req, res) => {
  let longURL = req.body.longURL;
  do {
    shortURL = generateRandomString();
  }
  while (urlDatabase[shortURL]);
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
