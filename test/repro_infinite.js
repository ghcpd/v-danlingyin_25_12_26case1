const { retry } = require('./tmp_input')

let externalCounter = 0
function failingFn() {
  externalCounter++
  return Promise.reject(new Error('always fail ' + externalCounter))
}

// call with retryCount=2 — due to bug, retries will continue beyond 2
retry(failingFn, { retryCount: 2 })
  .then(() => console.log('unexpected success'))
  .catch((err) => {
    console.error('final catch:', err && err.message)
    console.error(err && err.stack)
  })

// after 50ms, print how many attempts were made
setTimeout(() => {
  console.log('externalCounter after 50ms =', externalCounter)
  if (externalCounter > 2) {
    console.log('=> observed retries beyond retryCount')
  } else {
    console.log('=> retries did NOT exceed retryCount (unexpected)')
  }
  // exit so CI doesn't hang in case of infinite loop
  process.exit(0)
}, 50)
