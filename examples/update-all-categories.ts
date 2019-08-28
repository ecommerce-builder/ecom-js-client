import EcomClient from '..';

import firebaseConfig from './firebase-config';

import data from './data/categories-example-data';

console.dir(data);

const client = EcomClient.initApp({
  endpoint: 'http://localhost:8080',
  firebaseConfig: firebaseConfig
});


(async () => {
  try {
    const authUser = await client.auth.signInWithDeveloperKey(process.env.DEVKEY);

    await client.db.categories.set(data);
  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
