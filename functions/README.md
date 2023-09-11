# cf-hotreload

The goal of this project is to implement a hot-reloading mechanism for dynamic code execution within a Firebase Cloud Function. For that, we use the [Firebase Admin SDK](https://firebase.google.com/docs/admin/) to load a GCS-Hosted JavaScript file and execute it within the function.

## Local development

To run the project locally, you need to have the [Firebase CLI](https://firebase.google.com/docs/cli/) installed. Then, you can run the following commands:

```bash
# Install dependencies
npm install

# Run the function locally
npm run serve
```

Make sure to create your own `.env` file with the following variables:

```bash
GCLOUD_BUCKET_NAME=name-of-the-bucket
CF_EXTERNAL_FILE_NAME=name-of-the-file.js
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
npm install

# Deploy the function
npm run deploy
```

## Testing

The library used for testing is [vitest](https://vitest.dev/guide/) and the tests are located in the `test` folder. To run the tests in watch mode, you can run the following command:

```bash
npm run test
```
