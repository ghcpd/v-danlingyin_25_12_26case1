const { retry } = require('./input');

console.log('Starting failing test (may hit stack overflow)...');
retry(() => Promise.reject(new Error('always fail')), { retryCount: 2 })
  .then(res => console.log('success:', res))
  .catch(err => console.error('caught error:', err));

// Keep the process alive a bit so async errors print
setTimeout(() => {
  console.log('test_fail: done waiting 5s');
}, 5000);