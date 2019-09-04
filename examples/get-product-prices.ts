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

    const querySnapshot = await client.db.products
      .doc('7e2c2747-039e-4e30-ad83-01b528c6cf2b')
      .prices
      .where('price_list_id', '==', '7caa3500-d218-496e-957f-67a187872505').get();

    )


  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
