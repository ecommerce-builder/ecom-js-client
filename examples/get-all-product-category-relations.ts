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


    const querySnap = await client.db.productCategory.get();

    const docs = querySnap.docs;
    docs.forEach(docSnap => {
      console.dir(docSnap.id);
      console.dir(docSnap.data());
    });

  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
