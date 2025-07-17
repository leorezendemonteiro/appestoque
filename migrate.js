const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Migration script to copy existing Firestore data to the multi-company
 * structure under "empresas/matturado". Existing data is kept intact
 * in the old location.
 *
 * Usage:
 *   node migrate.js /path/to/serviceAccount.json
 *
 * The service account key can be generated in the Firebase Console
 * under Settings > Service Accounts. Download the JSON file and
 * provide its path when running the script or set the
 * GOOGLE_APPLICATION_CREDENTIALS environment variable.
 *
 * You need to install the Firebase Admin SDK first:
 *   npm install firebase-admin
 *
 * This script assumes a root collection "usuarios" with a field "empresa".
 * Adjust the queries if your project stores users differently.
 * Existing documents at the destination will be updated (merge: true).
 */

const credentialPath = process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccount.json';
if (!fs.existsSync(credentialPath)) {
  console.error('Service account JSON not found. Pass the file path as an argument.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(credentialPath)))
});

const db = admin.firestore();
const DEST_COMPANY = 'matturado';

async function copyCollection(src, dest) {
  const snap = await src.get();
  for (const doc of snap.docs) {
    const destDoc = dest.doc(doc.id);
    console.log(`Copying ${doc.ref.path} -> ${destDoc.path}`);
    await destDoc.set(doc.data(), { merge: true });
    const subcols = await doc.ref.listCollections();
    for (const sub of subcols) {
      await copyCollection(sub, destDoc.collection(sub.id));
    }
  }
}

async function migrateRootCollections() {
  const collections = await db.listCollections();
  for (const col of collections) {
    if (['empresas', 'usuarios'].includes(col.id)) continue; // skip collections already in new structure
    await copyCollection(col, db.collection('empresas').doc(DEST_COMPANY).collection(col.id));
  }
}

async function migrateUsers() {
  const usersCol = db.collection('usuarios');
  let snap = null;
  try {
    snap = await usersCol.where('empresa', '==', DEST_COMPANY).get();
  } catch (err) {
    // collection may not exist in old model
    console.warn('Collection "usuarios" not found or missing "empresa" field');
  }

  if (snap && !snap.empty) {
    for (const doc of snap.docs) {
      const data = doc.data();
      const destRef = db.collection('empresas').doc(DEST_COMPANY).collection('usuarios').doc(doc.id);
      console.log(`Migrating user ${doc.id} -> ${destRef.path}`);
      // overwrite if already exists
      await destRef.set({
        email: data.email,
        uid: doc.id,
        nome: data.nome || '',
        role: data.role || 'usuario'
      }, { merge: true });
    }
  } else {
    console.log('No user documents found to migrate. If users are stored elsewhere, update the script.');
  }

  // Also check Firebase Authentication custom claims
  try {
    let nextPageToken;
    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      for (const user of result.users) {
        if (user.customClaims && user.customClaims.empresa === DEST_COMPANY) {
          const destRef = db.collection('empresas').doc(DEST_COMPANY).collection('usuarios').doc(user.uid);
          console.log(`Migrating auth user ${user.email} (${user.uid})`);
          // overwrites existing user docs
          await destRef.set({
            email: user.email || '',
            uid: user.uid,
            nome: user.displayName || '',
            role: user.customClaims.role || 'usuario'
          }, { merge: true });
        }
      }
      nextPageToken = result.pageToken;
    } while (nextPageToken);
  } catch (err) {
    console.error('Error while reading auth users', err);
  }
}

(async () => {
  try {
    await migrateRootCollections();
    await migrateUsers();
    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
})();

