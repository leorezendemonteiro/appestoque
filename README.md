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
3. Enable **Cloud Firestore**.
4. **Configure the Firestore security rules** as described in [`firestore.rules`](firestore.rules). The rules already consider a multi-company structure where all data lives under `empresas/{empresaId}`.
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

## Multi-company mode

Use the credentials `admin@gestaomesa360.com` / `mesa360` to access the **superadmin** area. From there it is possible to cadastrar novas empresas e criar o usuário administrador de cada uma.

## Usage

- **Login or sign up** – Create an account or log in using the form on the home screen.
- **Add items** – In the **Estoque** tab add stock items, or use **Produção** to log production entries.
- **Generate reports** – Visit the **Relatórios** tab to download stock, shopping list and production reports in PDF format.
- **CMV calculation** – Use the **Cálculo do CMV** tab to calcular monthly CMV and apply it to technical sheets. The most recent value is shown in **Ficha Técnica** and used to suggest sale prices.
## Migration script

Use `migrate.js` to copy the existing single-company data to the new multi-company structure.

1. In the Firebase console go to **Project Settings > Service accounts** and click **Generate new private key**. Save the JSON file inside the repository (for example `serviceAccount.json`).
2. Install the Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```
3. Run the migration providing the path to the service account file:
   ```bash
   node migrate.js serviceAccount.json
   ```

The script copies every root collection to `empresas/matturado/<colecao>` and migrates users belonging to Matturado to `empresas/matturado/usuarios`. Nothing is deleted from the old structure. Logs in the terminal show each migrated document.

