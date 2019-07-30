// const chai = require('chai');
// const assert = chai.assert;
// const firebase = require('@firebase/app').default;
// require('@firebase/auth');

// const fetch = require('node-fetch');
// global.fetch = fetch;

// const fbConfig = require('../firebase-config.json');

// EcomClient = require('../dist/index.cjs');

// const TEST_EMAIL = process.env.TEST_EMAIL;
// const TEST_PASSWORD = process.env.TEST_PASSWORD;

// var customer;

// describe('Order', async () => {
//   it('should sign-in using Firebase auth', async function() {
//     try {
//       if (!firebase.apps.length) {
//         firebase.initializeApp(fbConfig);
//       }

//       userCredential = await firebase.auth().signInWithEmailAndPassword(TEST_EMAIL, TEST_PASSWORD);

//       idTokenResult = await userCredential.user.getIdTokenResult();

//       // save the JWT in the JS Client
//       ecom.setJWT(idTokenResult.token);
//       ecom.setCustomerId(idTokenResult.claims.cid);
//       ecom.setDebugMode(true);

//       customer = await ecom.getCustomer(userCredential.user);
//     } catch (err) {
//       throw err;
//     }
//   });

//   it('should place a new order', async function() {
//     try {
//       const order = await ecom.placeOrder('Joe Shopper', TEST_EMAIL, {
//         contactName: 'Mr Biller',
//         addr1: '1 Bill Street',
//         addr2: 'Billton',
//         city: 'Bill City',
//         county: 'Bill County',
//         postcode: 'BB1 9BB',
//         country: 'GB'
//       },
//       {
//         contactName: 'Mr Shipper',
//         addr1: '2 Ship Street',
//         addr2: 'Shipton',
//         city: 'Ship city',
//         county: 'Ship County',
//         postcode: 'SS1 9SS',
//         country: 'GB'
//       });

//       console.dir(order);
//     } catch (err) {
//       throw err;
//     }
//   });
// });
