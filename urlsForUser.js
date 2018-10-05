// this function takes a database and filters it using given id
const urlsForUser = (database, id) => {
  const filteredURLs = {};
  for (const url in database) {
    if (id == database[url].userID) { filteredURLs[url] = database[url]; }
  }
  return filteredURLs;
};

module.exports = urlsForUser;