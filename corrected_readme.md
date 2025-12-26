Retry Utility
===============

Small, dependency-free helper to call an async function and (optionally) retry on failure.

API
---
- retry(fn, options?)
  - fn: () => Promise<T>
  - options.retryCount?: number — maximum number of attempts (must be an integer between 1 and 5). Default: 3

Important notes
---------------
- The function validates `retryCount` synchronously and will throw if the value is out of range.
- Known bug in the published implementation: the internal attempt counter is not preserved across recursive retries. That means the library will not enforce the retry limit as intended. See "Known issues & workaround" below.

Working examples
----------------
1) Basic — immediate success (works as implemented)

```ts
import { retry } from 'retry-util'

await retry(() => Promise.resolve('ok'))
// resolves with 'ok'
```

2) Validation error when passing out-of-range `retryCount` (works as implemented)

```ts
import { retry } from 'retry-util'

// throws: Error("retryCount must be between 1 and 5")
retry(() => Promise.resolve('x'), { retryCount: 0 })
```

3) Retry a flaky operation (only safe if the operation is expected to succeed quickly).
This example demonstrates a case where the operation eventually succeeds; it works because the success happens before any limit would matter.

```ts
let attempts = 0
await retry(async () => {
  attempts++
  if (attempts < 2) throw new Error('transient')
  return 'ok'
}, { retryCount: 3 })
// resolves with 'ok' on the 2nd attempt
```

Known issues & recommended workarounds
-------------------------------------
- Issue: the library validates `retryCount` but (in the current implementation) does not correctly stop after the configured number of attempts. If the retried function never resolves, the helper may recurse until the process fails (stack overflow) instead of stopping after `retryCount` attempts.

Workaround (application-side): implement your own bounded retry wrapper or use the pattern below to limit attempts in user code.

```ts
// application-side bounded retry
async function boundedRetry(fn, maxAttempts = 3) {
  let lastErr
  for (let i = 1; i <= maxAttempts; i++) {
    try { return await fn() } catch (err) { lastErr = err }
  }
  throw lastErr
}
```

If you maintain this package: see the suggested fix in the repository's issue tracker — the correct implementation should be iterative (or pass an attempts counter) so that the configured limit is enforced.

Compatibility / constraints
---------------------------
- Options: only `retryCount` is supported.
- `retryCount` must be an integer between 1 and 5 (inclusive).
- The helper does not implement backoff or jitter — callers must implement delays if needed.

Changelog (documentation-only)
------------------------------
- Removed examples that assumed a different API (`configure(...)`) — the exported function is `retry`.
- Documented the `retryCount` validation and the known bug; added a safe workaround.
