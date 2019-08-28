import EcomClient from '..';

import firebaseConfig from './firebase-config';

const client = EcomClient.initApp({
  endpoint: process.env.ENDPOINT,
  firebaseConfig: firebaseConfig,
  debug: true
});

(async () => {
  try {
    const authUser = await client.auth.signInWithDeveloperKey(process.env.DEVKEY);

    const docSnap = await client.db.productCategory.doc('52cc70d6-d3ae-4685-bfa4-e838fc84bb00').get();

    if (docSnap.exists) {
      console.dir(docSnap.data());
    }

  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
