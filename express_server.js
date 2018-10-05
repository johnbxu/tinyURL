// importing packages
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const generateRandomString = require('./generateRandomString');
const urlsForUser = require('./urlsForUser');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

// using packages
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['keydonut', 'keyeclair'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// variables
const PORT = 8080;
const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://lighthouselabs.ca',
    shortURL: 'b2xVn2',
    fullURL: 'http://localhost:8080/u/b2xVn2',
    userID: 'userRandomID',
    visits: 0,
    uniqueVisits: 0,
    visitors: {},
  },
  '9sm5xk': {
    longURL: 'http://www.google.com',
    shortURL: '9sm5xk',
    fullURL: 'http://localhost:8080/u/9sm5xk',
    userID: 'userRandomID',
    visits: 0,
    uniqueVisits: 0,
    visitors: {},
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
// endpoints for index page
app.get('/', (req, res) => {
  if (req.session.loggedIn && users[req.session.user_id]) { res.redirect('/urls'); }
  else {
    res.clearCookie('session');
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  // checks is user's id exists in the user database. This will be used in several instances throughout.
  if (req.session.loggedIn && users[req.session.user_id]) {
    let templateVars = {
      urls: urlsForUser(urlDatabase, req.session['user_id']),
      user_id: req.session['user_id'],
      loggedIn: req.session.loggedIn,
      email: users[req.session.user_id].email,
    };
    res.render('urls_index', templateVars);
  } else {
    //if user doesn't exist in database, clear session cookies
    res.clearCookie('session');
    res.redirect('/login');
  }
});

// enpoints for creating new shortURL
app.get('/urls/new/', (req, res) => {
  if (req.session.loggedIn && users[req.session.user_id]) {
    let templateVars = {
      user_id: req.session['user_id'],
      loggedIn: req.session.loggedIn,
      email: req.session.email,
    };
    res.render('urls_new', templateVars);
  } else {
    res.clearCookie('session');
    res.redirect('/login');
  }
});

app.post('/urls/new/', (req, res) => {
  if (req.session.loggedIn && users[req.session.user_id]) {
    // initializes new property in urlDatabase using generated short URL
    let longURL = req.body.longURL;
    let shortURL = generateRandomString();
    let date = new Date();
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL].longURL = longURL;
    urlDatabase[shortURL].userID = req.session['user_id'];
    urlDatabase[shortURL].visits = 0;
    urlDatabase[shortURL].uniqueVisits = 0;
    urlDatabase[shortURL].timeCreated = date.toString().substring(0, 24);
    urlDatabase[shortURL].fullURL = req.protocol + '://' + req.get('host') + '/u/' + shortURL;
    res.redirect(`http://localhost:8080/urls/${shortURL}`);
  }
});

// endpoint for updating an URL
app.get('/urls/:id', (req, res) => {
  let shortURL;
  for (url in urlDatabase) {
    if (url == req.params.id) { shortURL = url; }
  }
  if (!shortURL) { res.redirect('/404'); }
  else {
    let templateVars = {
      url: urlDatabase[shortURL],
      uniqueVisitor: req.cookies.visitor,
      user_id: req.session.user_id,
      loggedIn: req.session.loggedIn,
      email: req.session.email,
    };
    res.render('urls_show', templateVars);
  }
});

// update and delete endpoints
app.delete('/urls/:id/delete', (req, res) => {
  let deleteURL = req.params.id;
  if (urlDatabase[deleteURL].userID == req.session['user_id']) { delete urlDatabase[deleteURL]; }
  else { res.redirect('/403'); }
  res.redirect('/');
});

app.put('/urls/:id/update', (req, res) => {
  let updateURL = req.params.id;
  if (urlDatabase[updateURL].userID == req.session['user_id']) { urlDatabase[updateURL].longURL = req.body.newurl; }
  else res.redirect('/403');
  res.redirect('/urls');
});

// redirect to longURL when shortURL is visited in /u/shortURL
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) { res.redirect('/404'); }
  else {
    let longURL = urlDatabase[shortURL].longURL;
    // adds http:// to long URL because express automatically redirects to /u/:longurl otherwise
    if (longURL.indexOf('http://') !== 0 ) { longURL = 'http://' + longURL; }

    // initializes visits counter for shortURL; also creates cookie and increments unique visitors for url
    urlDatabase[shortURL].visits = urlDatabase[shortURL].visits || 0;
    urlDatabase[shortURL].visits += 1;
    if (!req.cookies[shortURL]) {
      res.cookie(shortURL, true);
      urlDatabase[shortURL].uniqueVisits += 1;
    }

    // if unencrypted visitor cookie doesn't exist, generate a random visitor cookie. this keeps track of unique visitor id
    if (!req.cookies['visitor']) { res.cookie('visitor', generateRandomString()); }
    if (!urlDatabase[shortURL].visitors) { urlDatabase[shortURL].visitors = {}; }

    // handles visits and timestamps for each short URL
    let timeStamp = new Date();
    let visit = generateRandomString();
    urlDatabase[shortURL].visitors[visit] = {};
    urlDatabase[shortURL].visitors[visit].uniqueVisitor = req.cookies['visitor'];
    urlDatabase[shortURL].visitors[visit].visitTime = timeStamp.toString().substring(0, 24);

    res.redirect(longURL);
  }
});

// login and logout endpoints
app.get('/login', (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    loggedIn: req.session.loggedIn,
    email: req.session.email,
  };
  res.render('urls_login', templateVars);

});

app.post('/login', (req, res) => {
  let userId;
  for (user in users) {
    if (users[user].email == req.body.email) { userId = users[user].id; }
  }
  if (!bcrypt.compareSync(req.body.password, users[userId].password)) res.redirect('/403');
  else if (!userId) { res.redirect('/403'); }
  else {
    req.session.loggedIn = true;
    req.session.email = req.body.email;
    req.session.user_id = userId;
    res.redirect('/');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/urls');
});

// registration endpoints
app.get('/register', (req, res) => {
  if (req.session.loggedIn && users[req.session.user_id]) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      urls: urlDatabase,
      user_id: req.session.user_id,
      loggedIn: req.session.loggedIn,
      email: req.session.email,
    };
    res.render('urls_register', templateVars);
  }
});

app.post('/register', (req, res) => {
  let duplicate = false;
  for (const user in users) {
    const currentEmail = users[user].email;
    if (currentEmail == req.body.email) {
      duplicate = true;
    }
  }
  if (duplicate) { res.redirect('/400'); }
  else if (!duplicate) {
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
app.get('/404', (req, res) => {
  res.render('404');
});
// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});