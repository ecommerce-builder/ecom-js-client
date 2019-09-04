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


    const categoryDocRef = client.db.categories.doc('3d94663c-73cc-4615-9857-eaff195e6260');
    const productDocRef = client.db.products.doc('0b829479-b970-47da-8830-051d22d312c5');

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
