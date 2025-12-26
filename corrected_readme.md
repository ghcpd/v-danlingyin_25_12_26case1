# retry-util

A tiny utility that executes a Promise-returning function and (intended to) retry on failure.

API
- `retry(fn, options?)` — attempts to call `fn()` and returns the resulting Promise.
- `options.retryCount` (optional) — number of allowed attempts (default: 3). Valid range: 1–5.

Important constraints
- `retryCount` is validated synchronously; passing a value outside 1–5 throws: `Error: retryCount must be between 1 and 5`.
- Current implementation: only a single successful `fn()` call is guaranteed. There is a known bug in the retry logic (see "Known issue").

Installation
```bash
pnpm install retry-util
```

Basic usage (works)
```ts
import { retry } from 'retry-util'

// simple successful call — resolves immediately
const result = await retry(() => Promise.resolve('ok'))
console.log(result) // 'ok'
```

Invalid-parameter example (shows the validation error)
```ts
import { retry } from 'retry-util'

try {
  // throws synchronously because 0 is outside the allowed range
  await retry(() => Promise.resolve('x'), { retryCount: 0 })
} catch (err) {
  console.error(err.message) // -> "retryCount must be between 1 and 5"
}
```

Notes & edge-cases
- Default `retryCount` is 3 (when `options` or `retryCount` is omitted).
- `retryCount` must be an integer between 1 and 5 inclusive.
- The implementation currently contains a bug in the retry loop (it does not correctly track attempts across retries). Because of that bug, examples that rely on multiple retries for a failing `fn` may not behave as expected. See `defects.txt` for details and suggested fixes.

License / support
- This README reflects the current behavior of the shipped `input.ts` implementation and only contains examples that run without relying on the broken retry loop.