# Retry Utility (Corrected Usage)

This package exports a single helper `retry` that calls an async function and retries on rejection.

## Key behavior & constraints ✅
- Function: `retry(fn, options?)`
- `fn` must be a function returning a `Promise`.
- `options.retryCount` default: **3** (if not provided).
- `retryCount` must be an integer between **1** and **5** (inclusive). Passing 0 or >5 throws: `Error("retryCount must be between 1 and 5")`.

> ⚠️ **Important edge case:** the current implementation has a bug: if `fn` *always* rejects, repeated retries may cause infinite recursion and a `RangeError: Maximum call stack size exceeded`. See defects and suggested fix below.

---

## Examples 🔧

1) Basic success (works with current code):

```js
const { retry } = require('./input');

retry(() => Promise.resolve('ok'))
  .then(res => console.log('success:', res))
  .catch(err => console.error('error:', err));
// Output: success: ok
```

2) Fail once then succeed (demonstrates retry behavior — works with current code):

```js
const { retry } = require('./input');

let attempts = 0;
retry(() => {
  return new Promise((resolve, reject) => {
    attempts++;
    if (attempts === 1) return reject(new Error('first failure'));
    return resolve('succeeded on attempt ' + attempts);
  });
}, { retryCount: 3 })
  .then(res => console.log(res))
  .catch(err => console.error('final error:', err));
// Expected output: 'succeeded on attempt 2'
```

3) Invalid `retryCount` demonstrates guard (throws immediately):

```js
const { retry } = require('./input');
retry(() => Promise.resolve('x'), { retryCount: 0 });
// Throws: Error("retryCount must be between 1 and 5")
```

---

## Notes & Troubleshooting 💡
- There is *no* global `configure` API in the codebase. The README previously showed `configure({ retryCount: 0 })` — that snippet is invalid and will either cause a ReferenceError (if run standalone) or, even if a configure existed, the value 0 would be rejected by the guard.

- If your function may fail repeatedly (e.g., network down), be careful: the implementation currently uses recursive retries in a way that resets the attempt counter on each recursive call — see the defects file for details and a recommended fix.

---

## Suggested fix (brief)
Replace the recursive retry logic with an iterative approach (or pass the attempt count through recursion). Example fix snippet:

```ts
export async function retry(fn, options = {}) {
  const retryCount = options.retryCount ?? 3;
  if (retryCount < 1 || retryCount > 5) throw new Error('retryCount must be between 1 and 5');

  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retryCount - 1) throw err;
    }
  }
}
```

This ensures at most `retryCount` attempts and avoids unbounded recursion.
