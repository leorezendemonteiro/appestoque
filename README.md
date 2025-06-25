# App Estoque

This project is a web based stock and production management tool built with Firebase.

## Firebase setup

Create a Firebase project and enable **Authentication** (with Email/Password) and **Cloud Firestore**. Replace the configuration values in `index.html` with your own:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

The application expects the following Firestore collections:

- `estoque` – stock items
- `producao` – production items
- `fornecedores` – supplier data

## Running

Simply open `index.html` in a modern browser. Because the application loads all scripts from CDN, no build step is required. If the browser blocks local module loading, serve the directory with any static server (e.g. `npx serve`).

