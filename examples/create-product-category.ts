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


    const categoryDocRef = client.db.categories.doc('7289c0b7-e2e5-4fea-baff-17a2683940f3');
    const productDocRef = client.db.products.doc('54d9d703-2a5f-42ea-9c8d-90e7e0b18ad7');

    const productCategoryDocRef = await client.db.productCategory.add({
      categoryDocumentReference: categoryDocRef,
      productDocumentReference: productDocRef
    });
  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
