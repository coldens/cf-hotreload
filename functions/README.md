# cf-hotreload

The goal of this project is to implement a hot-reloading mechanism for dynamic code execution within a Firebase Cloud Function. For that, we use the [Firebase Admin SDK](https://firebase.google.com/docs/admin/) to load a GCS-Hosted JavaScript file and execute it within the function.

## Local development

To run the project locally, you need to have the [Firebase CLI](https://firebase.google.com/docs/cli/) installed. Then, you can run the following commands:

```bash
# Install dependencies
pnpm install

# Run the function locally
pnpm run serve
```

Make sure to create your own `.env` file with the following variables:

```bash
# GCLOUD_BUCKET_NAME=name-of-the-bucket # optional, if you want to use a different bucket than the default one
COMPILED_FILE_NAME=compiled.js # This file will be compiled based on the source code in the source folder of the bucket
```

There is a sample file in the root folder called `.env.example` that you can use as a template.

## Local development + Storage emulator

To run the local storage emulator, you need to have the [Firebase CLI](https://firebase.google.com/docs/cli/) installed. Then, go to the parent folder, configure storage.rules and run the following commands:

```bash
firebase emulators:start
```

## Deploying to Firebase

To deploy the function to Firebase, you need to have the [Firebase CLI](https://firebase.google.com/docs/cli/) installed. Then, you can run the following commands:

```bash
# Install dependencies
pnpm install

# Deploy the function
pnpm run deploy
```

## Testing

The library used for testing is [vitest](https://vitest.dev/guide/) and the tests are located in the `test` folder. To run the tests in watch mode, you can run the following command:

```bash
pnpm run test
```

## Cloud Functions

This project includes three cloud functions that can be deployed to Firebase:

### `cfExecute`

This function executes a Google Cloud Storage-hosted script. It accepts two query parameters:

- `fileName`: the name of the file to execute (default: `out/compiled.js`)
- `bucket`: the name of the Google Cloud Storage bucket that contains the file (default: `firebase default bucket`)

The function returns the output of the executed script.

### `runSyncAndCompile`

This function syncs the source code with Google Cloud Storage and compiles it. It can be used to manually trigger a sync and compile operation. It does not accept any query parameters.

### `objectFinalizedListener`

This function listens for object finalized events in the default Google Cloud Storage bucket (or env variable `GCLOUD_BUCKET_NAME`). When an object with a name that includes the string "source" is finalized, the function syncs and compiles the source code. If the `cfExecute` function has been initialized, the function also clears the cache used by the `CloudExecuteFactory` class.

GitHub Copilot: Thank you for the clarification. In that case, here's an updated version of the section that talks about the compilation process:

GitHub Copilot: Sure, here's an example of a new section that talks about the compilation process:

## Compilation Process

This project uses [esbuild](https://esbuild.github.io/) to bundle the `source` folder in the Google Cloud Storage bucket that was previously downloaded to a temporal folder. The compilation process is triggered by the `objectFinalizedListener` cloud function, which listens for object finalized events in the default Google Cloud Storage bucket. The `runSyncAndCompile` cloud function can also be used to manually trigger the compilation process.

To compile the source code, `esbuild` looks for an `index.js` file in the `source` folder. This file should be the entry point of the application and should export an `async main()` function that receives the body request as a unique parameter. The `main()` function should return a response object that includes the `statusCode` and `body` properties.

Here's an example of an `index.js` file that exports a valid `main()` function:

```javascript
const _ = require("lodash");

async function main(requestBody) {
  const name = _.get(requestBody, "name", "World");
  return {
    statusCode: 200,
    body: `Hello ${name}!`,
  };
}

module.exports = { main };
```

When the `objectFinalizedListener` or `runSyncAndCompile` function is triggered, it downloads the contents of the `source` folder from the Google Cloud Storage bucket to a temporal folder. Then, it uses `esbuild` to bundle the `index.js` file and its dependencies into a single JavaScript file. The resulting file is saved in the `out` folder in the temporal directory.

If the compilation process is successful, the function uploads the contents of the `out` folder to the Google Cloud Storage bucket. The `cfExecute` function can then execute the compiled code by specifying the `fileName` parameter as `out/compiled.js`.
