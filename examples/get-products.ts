import EcomClient from '..';

import firebaseConfig from './firebase-config';

const client = EcomClient.initApp({
  endpoint: 'http://localhost:8080',
  firebaseConfig: firebaseConfig
});

(async () => {
  try {
    const authUser = await client.auth.signInWithDeveloperKey(process.env.DEVKEY);

    const querySnapshot = await client.db.products.get();

    querySnapshot.docs.forEach(productQueryDocumentSnapshot => {
      console.dir(productQueryDocumentSnapshot.id);
      console.dir(productQueryDocumentSnapshot.data());
    });

  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
