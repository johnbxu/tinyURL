// importing packages
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const generateRandomString = require('./generateRandomString');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

// using packages
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['keydonut', 'keyeclair'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// function to filter urls based on userID
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
const PORT = 8080;
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
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10),
  },
};

// ------------------------------endpoints ---------------------------------- //
// get requests
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session['user_id']),
    user_id: req.session['user_id'],
    loggedIn: req.session.loggedIn,
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// enpoints for creating new shortURL
app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.session['user_id'],
    loggedIn: req.session.loggedIn,
  };
  if (!req.session.loggedIn) {
    res.redirect('/');
  } else res.render('urls_new', templateVars);
});

app.post('/urls/new', (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = req.session['user_id'];
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

// page for updating an URL
app.get('/urls/:id', (req, res) => {
  let shortURL;
  for (url in urlDatabase) {
    if (url == req.params.id) {
      shortURL = url;
    }
  }
  let templateVars = {
    url: shortURL,
    user_id: req.session.user_id,
    loggedIn: req.session.loggedIn,
  };
  res.render('urls_show', templateVars);
});

// update and delete endpoints
app.delete('/urls/:id/delete', (req, res) => {
  let deleteURL = req.params.id;
  if (urlDatabase[deleteURL].userID == req.session['user_id']) {
    delete urlDatabase[deleteURL];
  } else res.redirect('/403');
  res.redirect('/');
});

app.put('/urls/:id/update', (req, res) => {
  let updateURL = req.params.id;
  if (urlDatabase[updateURL].userID == req.session['user_id']) {
    urlDatabase[updateURL].longURL = req.body.newurl;
  } else res.redirect('/403');
  res.redirect('/urls');
});

// redirect to longURL when shortURL is visited in /u/shortURL
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  if (!urlDatabase[shortURL]) res.redirect('403');
  if (longURL.indexOf('http://') < 0 || longURL.indexOf('http://') > 0) {
    longURL = 'http://' + longURL;
  }
  res.redirect(longURL);
});

// login and logout endpoints
app.get('/login', (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    loggedIn: req.session.loggedIn,
  };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  let userId;
  for (user in users) {
    if (users[user].email == req.body.email) {
      userId = users[user].id;
      if (!bcrypt.compareSync(req.body.password, users[userId].password)) {
        res.redirect('/403');
      }
    }
  }
  if (!userId) res.redirect('/403');
  req.session.loggedIn = true;
  req.session.email = req.body.email;
  req.session.user_id = userId;
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/urls');
});


// registration endpoints
app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    loggedIn: req.session.loggedIn,
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
    users[userid].password = bcrypt.hashSync(req.body.password, 10);
    res.redirect('/');
  }
});

// error endpoints
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