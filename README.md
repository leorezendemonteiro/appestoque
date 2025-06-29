# App Estoque

This project is a web based stock and production management tool built with Firebase.

## Getting started

Follow these steps to run the application locally.

### 1. Clone the repository

```bash
git clone https://github.com/leorezendemonteiro/appestoque.git
cd appestoque
```

### 2. Configure Firebase

1. Create a Firebase project in the [Firebase console](https://console.firebase.google.com/).
2. Enable **Authentication** using the **Email/Password** method.
3. Enable **Cloud Firestore** and create the collections `estoque`, `producao` and `fornecedores`.
4. **Configure the Firestore security rules** so that authenticated users can read and write. You can copy the sample rules from the file [`firestore.rules`](firestore.rules) included in this repository. In the Firebase console go to **Firestore Rules**, replace the current rules with the content of this file and publish them.
5. Open `index.html` in a text editor and scroll near the end of the file to the `<script type="module">` block. Inside it you will find a section that begins with:

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

6. Replace each value with the credentials provided by Firebase.

### 3. Serve `index.html` locally

Run any static web server from the project directory. One simple option is:

```bash
npx serve
```

The command prints a local URL (for example `http://localhost:3000`). Open that address in your browser to use the app. No build step is required because all scripts are loaded from CDNs.

## Usage

- **Login or sign up** – Create an account or log in using the form on the home screen.
- **Add items** – In the **Estoque** tab add stock items, or use **Produção** to log production entries.
- **Generate reports** – Visit the **Relatórios** tab to download stock, shopping list and production reports in PDF format.
