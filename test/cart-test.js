const chai = require('chai');
const assert = chai.assert;
EcomClient = require('../dist/index.cjs');

const firebase = require('@firebase/app').default;
require('@firebase/auth');

const fetch = require('node-fetch');
global.fetch = fetch;

//sslRootCAs = require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
//sslRootCAs
//  .inject()
//  .addFile(__dirname + '/../certs/api_spycameracctv_com.crt')
//  .addFile(__dirname + '/../certs/api_spycameracctv_com.ca-bundle');

const fbConfig = require('../firebase-config.json');

const TEST_ENDPOINT = process.env.TEST_ENDPOINT;
var userCredential;
var ecom;
var cart;

var water;
var desk;

describe('Cart', async () => {
  before(async () => {
  });

  it('should sign-in annoymously', async function() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(fbConfig);
      }

      userCredential = await firebase.auth().signInAnonymously();
    } catch (err) {
      throw err;
    }
  });

  it('should create a new ecom client', async function() {
    try {
      ecom = new EcomClient({
          fetch,
          endpoint: TEST_ENDPOINT
      });
      let idTokenResult = await userCredential.user.getIdTokenResult();

      // save the JWT in the JS Client
      ecom.setJWT(idTokenResult.token);
      //ecom.setCustomerId(idTokenResult.claims.cid);
    } catch (err) {
      throw err;
    }
  });

  it('should create a new cart', async function() {
    cart = await ecom.createCart();

    let items = await cart.getItems();
    let count = cart.countItems();

    assert.isEmpty(await cart.getItems());
    assert.strictEqual(count, 0);
  });

  it('should add 2 DESK-SKU to the cart', async function() {
    await cart.addItem('DESK-SKU', 2);

    let items = await cart.getItems();
    let count = cart.countItems();

    assert.strictEqual(count, 2);

    assert.strictEqual(items[0].sku, 'DESK-SKU');
    assert.strictEqual(items[0].name, 'Oak Desk');
    assert.strictEqual(items[0].qty, 2);
    assert.strictEqual(items[0].unitPrice, 2987083);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');
  });

  it('should add a 5 TV to the cart', async function() {
    await cart.addItem('TV-SKU', 5);

    let items = await cart.getItems();
    let count = cart.countItems();

    assert.strictEqual(count, 7);

    assert.strictEqual(items[0].sku, 'DESK-SKU');
    assert.strictEqual(items[0].name, 'Oak Desk');
    assert.strictEqual(items[0].qty, 2);
    assert.strictEqual(items[0].unitPrice, 2987083);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');

    assert.strictEqual(items[1].sku, 'TV-SKU');
    assert.strictEqual(items[1].name, 'LCD TV System');
    assert.strictEqual(items[1].qty, 5);
    assert.strictEqual(items[1].unitPrice, 2066250);
    assert.typeOf(items[1].created, 'Date');
    assert.typeOf(items[1].modified, 'Date');
  });

  it('should add a 1 WATER item to the cart', async function() {
    await cart.addItem('WATER-SKU', 1);

    let items = await cart.getItems();
    let count = cart.countItems();

    assert.strictEqual(count, 8);

    assert.strictEqual(items[0].sku, 'DESK-SKU');
    assert.strictEqual(items[0].name, 'Oak Desk');
    assert.strictEqual(items[0].qty, 2);
    assert.strictEqual(items[0].unitPrice, 2987083);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');

    assert.strictEqual(items[1].sku, 'TV-SKU');
    assert.strictEqual(items[1].name, 'LCD TV System');
    assert.strictEqual(items[1].qty, 5);
    assert.strictEqual(items[1].unitPrice, 2066250);
    assert.typeOf(items[1].created, 'Date');
    assert.typeOf(items[1].modified, 'Date');

    assert.strictEqual(items[2].sku, 'WATER-SKU');
    assert.strictEqual(items[2].name, 'Water Bottle');
    assert.strictEqual(items[2].qty, 1);
    assert.strictEqual(items[2].unitPrice, 20417);
    assert.typeOf(items[2].created, 'Date');
    assert.typeOf(items[2].modified, 'Date');
    water = items[2];
  });

  it('should update WATER FROM 1 to 2 qty', async function() {
    await water.updateQty(2);

    let items = await cart.getItems();
    let count = cart.countItems();

    assert.strictEqual(count, 9);

    for (let i = 0; i < items.length; i++) {
      assert.hasAnyKeys(items[i], [
        'sku', 'name', 'qty', 'unitPrice', 'created', 'modified'
      ]);
    }

    assert.strictEqual(items[0].sku, 'DESK-SKU');
    assert.strictEqual(items[0].name, 'Oak Desk');
    assert.strictEqual(items[0].qty, 2);
    assert.strictEqual(items[0].unitPrice, 2987083);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');
    desk = items[0];

    assert.strictEqual(items[1].sku, 'TV-SKU');
    assert.strictEqual(items[1].name, 'LCD TV System');
    assert.strictEqual(items[1].qty, 5);
    assert.strictEqual(items[1].unitPrice, 2066250);
    assert.typeOf(items[1].created, 'Date');
    assert.typeOf(items[1].modified, 'Date');

    assert.strictEqual(items[2].sku, 'WATER-SKU');
    assert.strictEqual(items[2].name, 'Water Bottle');
    assert.strictEqual(items[2].qty, 2);
    assert.strictEqual(items[2].unitPrice, 20417);
    assert.typeOf(items[2].created, 'Date');
    assert.typeOf(items[2].modified, 'Date');
  });


  it('should remove the DESK item from the cart', async function() {
    assert.strictEqual(await desk.delete(), true);

    let items = await cart.getItems();
    let count = cart.countItems();

    assert.strictEqual(count, 7);

    assert.strictEqual(items[0].sku, 'TV-SKU');
    assert.strictEqual(items[0].name, 'LCD TV System');
    assert.strictEqual(items[0].qty, 5);
    assert.strictEqual(items[0].unitPrice, 2066250);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');

    assert.strictEqual(items[1].sku, 'WATER-SKU');
    assert.strictEqual(items[1].qty, 2);
    assert.strictEqual(items[1].unitPrice, 20417);
    assert.typeOf(items[1].created, 'Date');
    assert.typeOf(items[1].modified, 'Date');
  });

  it('should empty all items from the cart', async function() {
    await cart.emptyAllItems();

    assert.isEmpty(await cart.getItems());
    assert.strictEqual(cart.countItems(), 0);
  });
});
