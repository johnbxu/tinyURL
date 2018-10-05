const generateRandomString =()=> {
  let random = Math.random().toString(36).substring(2, 8);
  return random;
};

module.exports = generateRandomString;