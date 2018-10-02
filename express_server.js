const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const generateRandomString = require('./generateRandomString');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// variables
const urlDatabase = {
  'b2xVn2': 'http://lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com',
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  },
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
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
    user_id: req.cookies['user_id'],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

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
  let templateVars = {
    url: shortURL,
    username: req.cookies['username'],
    user_id: req.cookies['user_id'],
  };
  res.render('urls_show', templateVars);
});

app.post('/login', (req, res) => {
  res.cookie('loggedIn', true);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    user_id: req.cookies['user_id'],
    loggedIn: req.cookies.loggedIn
  };
  res.render('urls_login', templateVars);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('username');
  res.clearCookie('true');
  res.clearCookie('login');
  res.clearCookie('loggedIn');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
    user_id: req.cookies['user_id'],
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  let duplicate = false;
  for (const user in users) {
    const currentEmail = users[user].email;
    if (currentEmail == req.body.email) {
      duplicate = true;
      res.redirect('/400');
    }
  }
  if (!duplicate) {
    let userid = generateRandomString();
    users[userid] = {};
    users[userid].id = userid;
    users[userid].email = req.body.email;
    users[userid].password = req.body.password;
    // console.log(users);
    res.cookie('email', req.body.email);
    res.cookie('user_id', userid);
    res.redirect('/');
  }
});

app.get('/400', (req, res) => {
  res.render('400');
});

// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});