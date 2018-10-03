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

const urlsForUser = (id) => {
  const filteredURLs = {};
  for (const url in urlDatabase) {
    if (id == urlDatabase[url].userID) {
      filteredURLs[url] = urlDatabase[url];
    }
  }
  return filteredURLs;
};

// variables
const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://lighthouselabs.ca',
    userID: 'userRandomID',
  },
  '9sm5xk': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID',
  },
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

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.cookies['user_id']),
    user_id: req.cookies['user_id'],
    loggedIn: req.cookies.loggedIn,
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies['user_id'],
    loggedIn: req.cookies.loggedIn,
  };
  if (!req.cookies.loggedIn) {
    res.redirect('/');
  }
  res.render('urls_new', templateVars);
});

app.post('/urls/new', (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = req.cookies['user_id'];
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  let deleteURL = req.params.id;
  delete urlDatabase[deleteURL];
  res.redirect('/');
});

app.post('/urls/:id/update', (req, res) => {
  let updateURL = req.params.id;
  urlDatabase[updateURL].longURL = req.body.newurl;
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
    user_id: req.cookies['user_id'],
    loggedIn: req.cookies.loggedIn,
  };
  res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = {
    user_id: req.cookies['user_id'],
    loggedIn: req.cookies.loggedIn,
  };
  res.render('urls_login', templateVars);
  res.redirect('/');
});

app.post('/login', (req, res) => {
  let userId;
  for (user in users) {
    if (users[user].email == req.body.email) {
      userId = users[user].id;
      if (req.body.password != users[userId].password) {
        res.redirect('/403');
      }
    }
  }
  if (!userId) res.redirect('/403');
  res.cookie('loggedIn', true);
  res.cookie('email', req.body.email);
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('login');
  res.clearCookie('loggedIn');
  res.clearCookie('email');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies['user_id'],
    loggedIn: req.cookies.loggedIn,
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
    console.log(users);
    res.redirect('/');
  }
});

app.get('/400', (req, res) => {
  res.render('400');
});

app.get('/403', (req, res) => {
  res.render('403');
});

// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});