import EcomClient from '..';

import firebaseConfig from './firebase-config';

const client = EcomClient.initApp({
  endpoint: 'http://localhost:8080',
  firebaseConfig: firebaseConfig
});

(async () => {
  try {
    const authUser = await client.auth.signInWithDeveloperKey(process.env.DEVKEY);
    console.dir(authUser);

    console.dir(client);

    const s = await client.db.products.doc('d5792b6a-2df5-4c29-9ba1-69f469b289b7').get();
    console.dir(s.data());

  } catch (err) {
    throw err;
  }
})();
