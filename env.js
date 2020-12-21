require('dotenv').config({ path: `${__dirname}/.env` });
const _ = require('lodash');

const env = {
  PORT: 3000,
  ACCOUNT_API: 'http://localhost:3001',
  SECRET: 'local-secret',
};

process.env = Object.assign({}, env, process.env);

module.exports = _.pick(process.env, Object.keys(env));
