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

    const docRef = await client.db.products.add({
      path: 'example-product-4',
      sku: '4',
      name: 'Example Product Four'
    });

    docRef.images.add({
      path: 'http://www.example.com/images/apples.jpg'
    });



  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
