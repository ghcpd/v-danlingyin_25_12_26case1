// input.js - JS equivalent of input.ts for reproduction
function retry(fn, options) {
  options = options || {};
  const retryCount = options.retryCount ?? 3;

  if (retryCount < 1 || retryCount > 5) {
    throw new Error("retryCount must be between 1 and 5");
  }

  let attempts = 0;

  return fn().catch(async (err) => {
    if (attempts >= retryCount) {
      throw err;
    }
    attempts++;
    return retry(fn, { retryCount });
  });
}

module.exports = { retry };