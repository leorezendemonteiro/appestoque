# App Estoque

This project is a web based stock and production management tool built with Firebase.

## Getting started

1. **Clone the repository**

   ```bash
   git clone https://github.com/leorezendemonteiro/appestoque.git
   cd appestoque
   ```

2. **Configure Firebase**

   Create a Firebase project and enable **Authentication** (Email/Password) and **Cloud Firestore**.
   Open `index.html` and locate the block starting with `const firebaseConfig = {` inside the `<script type="module">` section near the bottom of the file.
   Replace the sample credentials with your own:

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

   Your Firestore database should contain the collections `estoque`, `producao` and `fornecedores`.

3. **Serve the application locally**

   Use any static web server to host `index.html`. For example:

   ```bash
   npx serve
   ```

   Open the printed local URL in your browser.

Once served, the app requires no build step because all scripts are loaded from CDNs.

## Usage

- **Login or sign up** – Create an account or log in using the form on the home screen.
- **Add items** – In the **Estoque** tab add stock items, or use **Produção** to log production entries.
- **Generate reports** – Visit the **Relatórios** tab to download stock, shopping list and production reports in PDF format.
