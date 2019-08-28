import EcomClient from '..';

import firebaseConfig from './firebase-config';

const client = EcomClient.initApp({
  endpoint: process.env.ENDPOINT,
  firebaseConfig: firebaseConfig
});


(async () => {
  try {
    const authUser = await client.auth.signInWithEmailAndPassword('andy+root@andyfusniak.com', 'root8QFSQ2BzCqrk');
    const docRef = client.db.products.doc('6988381a-9121-4c0c-a191-37a3973a2fab');
    const snap = await docRef.get();

    if (snap.exists) {
      console.dir(snap.data());
    }

    // await client.auth.sendPasswordResetEmail('andy+root@andyfusniak.com');
  } catch (err) {
    console.log(err.status);
    console.log(err.code);
    console.log(err.message);
  }
})();
