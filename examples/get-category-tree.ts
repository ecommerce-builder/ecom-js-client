import EcomClient from '..';

(async () => {
  try {
    const client = await EcomClient.initApp({
      endpoint: process.env.ENDPOINT
    });

    await client.auth.signInWithDeveloperKey(process.env.DEVKEY);

    const docSnap = await client.db.categoryTree.get();

    if (docSnap.exists) {
      console.dir(docSnap.data());
    }

  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();
