import EcomClient from '..';

import firebaseConfig from './firebase-config';

const client = EcomClient.initApp({
  endpoint: process.env.ENDPOINT,
  firebaseConfig: firebaseConfig
});

(async () => {
  try {
    const authUser = await client.auth.signInWithDeveloperKey(process.env.DEVKEY);

    const docRef = await client.db.images.doc('6c9fe6c1-729d-4a7c-8258-6cf0a3016703');

    const docSnap = await docRef.get();
    const data = docSnap.data();
    console.dir(data);

    console.dir(data.productDocumentReference.parent);

  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
