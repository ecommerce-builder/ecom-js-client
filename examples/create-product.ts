import EcomClient from '..';

import firebaseConfig from './firebase-config';

const client = EcomClient.initApp({
  endpoint: 'http://localhost:8080',
  firebaseConfig: firebaseConfig
});

(async () => {
  try {
    const authUser = await client.auth.signInWithDeveloperKey(process.env.DEVKEY);

    const docRef = await client.db.products.add({
      path: 'my-example-path',
      sku: 'product-sku',
      name: 'Example widget product'
    });

    let docSnap = await client.db.products.doc(docRef.id).get();
    if (docSnap.exists) {
      console.dir(docSnap.data());
    }

    await docRef.set({
      path: 'my-example-path-new',
      sku: 'product-sku-new',
      name: 'Example widget product new'
    });

    docSnap = await client.db.products.doc(docRef.id).get();
    if (docSnap.exists) {
      console.dir(docSnap.data());
    }

    await docRef.delete();
  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
