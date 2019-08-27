const chai = require('chai');
const assert = chai.assert;
const firebase = require('@firebase/app').default;
require('@firebase/auth');

const fetch = require('node-fetch');
global.fetch = fetch;

const fbConfig = require('../firebase-config.json');

EcomClient = require('../dist/index.cjs');

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

let cart;

describe('Order', async () => {
  it('should sign-in using Firebase auth', async function() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(fbConfig);
      }

      userCredential = await firebase.auth().signInWithEmailAndPassword(TEST_EMAIL, TEST_PASSWORD);

      idTokenResult = await userCredential.user.getIdTokenResult();

      // save the JWT in the JS Client
      ecom.setJWT(idTokenResult.token);
      ecom.setCustomerId(idTokenResult.claims.cid);
      ecom.setDebugMode(true);

      customer = await ecom.getCustomer(userCredential.user);
    } catch (err) {
      throw err;
    }
  });

  it('should create a cart and add some items to buy', async function() {
    cart = await ecom.createCart();

    await cart.addItem('TV-SKU', 1);
    await cart.addItem('PHONE-SKU', 2);
    await cart.addItem('WATER-SKU', 5);
    await cart.addItem('DESK-SKU', 1);
  });

  it('should place a new order', async function() {
    try {
      const order = await ecom.placeGuestOrder('Joe Shopper', TEST_EMAIL, cart.getCartId(), {
        contactName: 'Mr Biller',
        addr1: '1 Bill Street',
        addr2: 'Billton',
        city: 'Bill City',
        county: 'Bill County',
        postcode: 'BB1 9BB',
        country: 'GB'
      },
      {
        contactName: 'Mr Shipper',
        addr1: '2 Ship Street',
        addr2: 'Shipton',
        city: 'Ship city',
        county: 'Ship County',
        postcode: 'SS1 9SS',
        country: 'GB'
      });

      placeGuestOrder(contactName: string, email: string, cartId : string, billing: Address, shipping: Address,) : Promise<Order | null>
      console.dir(order);
    } catch (err) {
      throw err;
    }
  });
});
