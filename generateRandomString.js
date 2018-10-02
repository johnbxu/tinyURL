const generateRandomString =()=> {
  let random = Math.random().toString(36).substring(2, 7);
  return random;
};

module.exports = generateRandomString;