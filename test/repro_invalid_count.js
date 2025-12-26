const { retry } = require('./tmp_input')

try {
  // this should throw synchronously (validation in retry)
  retry(() => Promise.resolve('ok'), { retryCount: 0 })
  console.log('NO THROW')
} catch (err) {
  console.error('CAUGHT ERROR:', err && err.message)
  console.error(err && err.stack)
}
