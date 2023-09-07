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