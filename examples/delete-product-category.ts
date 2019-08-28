import EcomClient from '..';

import firebaseConfig from './firebase-config';

const client = EcomClient.initApp({
  endpoint: process.env.ENDPOINT,
  firebaseConfig: firebaseConfig,
  debug: false
});

(async () => {
  try {
    const authUser = await client.auth.signInWithDeveloperKey(process.env.DEVKEY);


    const productCategoryDocRef = client.db.productCategory.doc('5491dca3-bfcc-47b1-933f-ed1f3b49dff2');

    await productCategoryDocRef.delete();

  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
