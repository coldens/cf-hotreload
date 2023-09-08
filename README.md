# Reload Deployed Cloud Function

General repository of the project, containing the source code for the cloud functions and all the other files needed for the project.

## Setup

Make sure you have [Node.js >= 18](https://nodejs.org/) and [Firebase CLI](https://firebase.google.com/docs/cli/) installed.

Create storage.rules for the storage emulator using firebase init, then select storage in the list of features to setup.

```bash
firebase init emulators
```

Then run the following commands:

```bash
# Run emulators
firebase emulators:start
```
