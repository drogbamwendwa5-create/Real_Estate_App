const morgan = require('morgan');

const logger = () => {
  if (process.env.NODE_ENV === 'development') {
    return morgan('dev');
  }
  return morgan('combined');
};

module.exports = logger;