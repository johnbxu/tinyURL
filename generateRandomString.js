// This function generates a random alphanumeric string in base 36 and cuts it down to length of 5
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = generateRandomString;