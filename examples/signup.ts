import EcomClient from '..';

(async () => {
  try {
    const client = await EcomClient.initApp({
      endpoint: process.env.ENDPOINT
    });

    const user = await client.auth.signInAnonymously();

    const authUser = await client.auth.createUser('andyfusniak+test1@gmail.com', 'testtest', 'Andy', 'Test 1');
  } catch (err) {
    throw err;
  }
})();
