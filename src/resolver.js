const someJSON = require('../package.json')

module.exports = {
  Query: {
    hello: () => ({ packageJSON: someJSON })
  }
};

