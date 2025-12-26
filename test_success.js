const { retry } = require('./input');

retry(() => Promise.resolve('ok'))
  .then(res => console.log('success:', res))
  .catch(err => console.error('error:', err));