# Retry Utility

This library provides a simple retry helper for asynchronous functions.

## Usage

Import the `retry` function from the source file:

```ts
import { retry } from './input';
```

Use the `retry` function to wrap an asynchronous function that returns a `Promise<unknown>`:

```ts
const myAsyncFunction = async () => {
  // Code that might throw an error
  if (Math.random() < 0.5) {
    throw new Error('Random failure');
  }
  return 'Success';
};

// Retry the function up to 2 times on failure
retry(myAsyncFunction, { retryCount: 2 })
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Final error:', error));
```

## Options

- `retryCount` (optional): The number of retry attempts. Defaults to 3. Must be between 1 and 5 inclusive.

If `retryCount` is outside the range 1-5, an error is thrown: "retryCount must be between 1 and 5".

The function will attempt to execute the provided function, and if it rejects, it will retry up to the specified number of times.

Note: Due to an implementation issue in the code, if the function consistently fails, it may enter an infinite retry loop. This is a code bug, not a documentation issue.</content>
<parameter name="filePath">c:\Users\v-danlingyin\Documents\microsoft_projects_files\bugBash\1226\case1\grok-fast\corrected_readme.md