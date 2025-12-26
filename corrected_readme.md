# Retry Utility - Corrected Documentation

This library provides a retry helper function for handling promise failures with configurable retry limits.

## Installation

```bash
pnpm install retry-util
```

## API Documentation

### `retry(fn, options)`

Executes an async function and retries it on failure up to a specified number of times.

**Parameters:**
- `fn: () => Promise<unknown>` - An async function (returns a Promise) that will be executed and retried on failure
- `options?: RetryOptions` - Configuration object (optional)
  - `retryCount?: number` - Number of retry attempts (default: 3, valid range: 1-5)

**Returns:** `Promise<unknown>` - The result of the async function if successful, or throws the last error

**Throws:** 
- `Error: "retryCount must be between 1 and 5"` - If retryCount is outside valid range
- Original error from `fn()` - If all retries are exhausted

## Usage Examples

### Basic Usage (Default 3 Retries)

```ts
import { retry } from 'retry-util'

const fetchData = async () => {
  const response = await fetch('https://api.example.com/data')
  if (!response.ok) throw new Error('API failed')
  return response.json()
}

// Uses default retryCount: 3
try {
  const data = await retry(fetchData)
  console.log('Success:', data)
} catch (err) {
  console.error('Failed after retries:', err.message)
}
```

### Custom Retry Count

```ts
import { retry } from 'retry-util'

const fetchWithOneRetry = async () => {
  const response = await fetch('https://api.example.com/data')
  return response.json()
}

// Retry once (total 2 attempts: 1 initial + 1 retry)
try {
  const data = await retry(fetchWithOneRetry, { retryCount: 1 })
  console.log('Data:', data)
} catch (err) {
  console.error('Failed:', err.message)
}
```

### Maximum Retries

```ts
import { retry } from 'retry-util'

const unreliableOperation = async () => {
  // Simulating an operation that fails randomly
  if (Math.random() < 0.8) {
    throw new Error('Random failure')
  }
  return 'success'
}

// Maximum 5 retries allowed
try {
  const result = await retry(unreliableOperation, { retryCount: 5 })
  console.log('Result:', result)
} catch (err) {
  console.error('Operation failed after 5 retries')
}
```

## Configuration Constraints

### Valid RetryCount Values

The `retryCount` parameter must be between 1 and 5 (inclusive):

| Value | Meaning | Status |
|-------|---------|--------|
| 0 | ❌ Invalid - will throw error | Invalid |
| 1 | Minimum retries | Valid |
| 2 | 2 retries | Valid |
| 3 | Default (recommended) | Valid |
| 4 | 4 retries | Valid |
| 5 | Maximum retries allowed | Valid |
| 6+ | ❌ Invalid - will throw error | Invalid |

### Invalid Configuration Example

```ts
// ❌ INVALID - Will throw immediately
retry(fn, { retryCount: 0 })  // Error: retryCount must be between 1 and 5

// ❌ INVALID - Will throw immediately  
retry(fn, { retryCount: 6 })  // Error: retryCount must be between 1 and 5
```

## Error Handling

### Validation Errors

```ts
import { retry } from 'retry-util'

const fn = async () => Promise.resolve('ok')

try {
  // This throws immediately due to invalid config
  await retry(fn, { retryCount: 0 })
} catch (err) {
  console.error(err.message)  // "retryCount must be between 1 and 5"
}
```

### Operation Failures

```ts
import { retry } from 'retry-util'

const failingFn = async () => {
  throw new Error('Operation always fails')
}

try {
  // After 3 retries, the original error is thrown
  await retry(failingFn, { retryCount: 3 })
} catch (err) {
  console.error(err.message)  // "Operation always fails"
}
```

## Type Definitions

```ts
type RetryOptions = {
  retryCount?: number
}

export function retry(
  fn: () => Promise<unknown>,
  options?: RetryOptions
): Promise<unknown>
```

## Best Practices

1. **Use default values when appropriate** - The default `retryCount: 3` works well for most use cases
2. **Only increase retries for unreliable operations** - Use higher values (4-5) for flaky network calls
3. **Use lower values for time-sensitive operations** - Use 1-2 retries if latency is critical
4. **Always handle errors** - Even with retries, the operation may fail, so wrap in try-catch
5. **Don't retry non-idempotent operations** - Only retry operations that are safe to repeat multiple times

## Common Patterns

### Retry with Exponential Backoff (Custom Implementation)

```ts
import { retry } from 'retry-util'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function retryWithBackoff(
  fn: () => Promise<unknown>,
  retryCount: number = 3,
  baseDelay: number = 100
) {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < retryCount - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await sleep(delay)
      }
    }
  }
  
  throw lastError
}

// Usage
const result = await retryWithBackoff(() => fetch('https://api.example.com'), 5, 100)
```

## Notes

- Each call to `retry()` starts fresh with the specified `retryCount`
- The default value is 3 retries, which is suitable for most network operations
- The function only accepts Promise-returning functions (async functions)
- Synchronous functions will not work with this utility
