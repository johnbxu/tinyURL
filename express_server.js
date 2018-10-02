const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

var urlDatabase = {
  'b2xVn2': 'http://lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com',
};

// app.get('/', (req, res) => {
  // res.send('Hello!');
// });

app.get('/', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
  };
  res.render('urls_show', templateVars);
});

app.get('/hello', (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render('hello_world', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
