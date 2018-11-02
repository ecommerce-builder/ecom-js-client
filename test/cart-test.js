const chai = require('chai');
const assert = chai.assert;

EcomClient = require('../lib/index');

var ecom;
var cart;

describe('Ecom Client SDK', async () => {
  before(async () => {
  });

  it('should create a new ecom client', function(done) {
    ecom = new EcomClient('http://localhost:9000');
    done();
  });


  it('should create a new cart', async function() {
    cart = await ecom.createCart();

    let items = cart.getItems();
    let count = cart.itemCount();

    assert.isEmpty(cart.getItems());
    assert.strictEqual(count, 0);
  });

  it('should add a 2 DESK to the cart', async function() {
    await cart.addItem('DESK', 2);

    let items = cart.getItems();
    let count = cart.itemCount();

    assert.strictEqual(count, 1);

    assert.strictEqual(items[0].sku, 'DESK');
    assert.strictEqual(items[0].qty, 2);
    assert.strictEqual(items[0].unit_price, 254.82);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');
  });

  it('should add a 5 TV to the cart', async function() {
    await cart.addItem('TV', 5);

    let items = cart.getItems();
    let count = cart.itemCount();

    assert.strictEqual(count, 2);

    assert.strictEqual(items[0].sku, 'DESK');
    assert.strictEqual(items[0].qty, 2);
    assert.strictEqual(items[0].unit_price, 254.82);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');

    assert.strictEqual(items[1].sku, 'TV');
    assert.strictEqual(items[1].qty, 5);
    assert.strictEqual(items[1].unit_price, 144.57);
    assert.typeOf(items[1].created, 'Date');
    assert.typeOf(items[1].modified, 'Date');
  });

  it('should add a 1 WATER item to the cart', async function() {
    await cart.addItem('WATER', 1);

    let items = cart.getItems();
    let count = cart.itemCount();

    assert.strictEqual(count, 3);

    assert.strictEqual(items[0].sku, 'DESK');
    assert.strictEqual(items[0].qty, 2);
    assert.strictEqual(items[0].unit_price, 254.82);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');

    assert.strictEqual(items[1].sku, 'TV');
    assert.strictEqual(items[1].qty, 5);
    assert.strictEqual(items[1].unit_price, 144.57);
    assert.typeOf(items[1].created, 'Date');
    assert.typeOf(items[1].modified, 'Date');

    assert.strictEqual(items[2].sku, 'WATER');
    assert.strictEqual(items[2].qty, 1);
    assert.strictEqual(items[2].unit_price, 2.45);
    assert.typeOf(items[2].created, 'Date');
    assert.typeOf(items[2].modified, 'Date');
  });

  it('should update WATER FROM 1 to 2 qty', async function() {
    await cart.updateItemQty('WATER', 2);

    let items = cart.getItems();
    let count = cart.itemCount();

    assert.strictEqual(count, 3);

    for (let i = 0; i < items.length; i++) {
      assert.hasAllKeys(items[i], [
        'sku', 'qty', 'unit_price', 'created', 'modified'
      ]);
    }

    assert.strictEqual(items[0].sku, 'DESK');
    assert.strictEqual(items[0].qty, 2);
    assert.strictEqual(items[0].unit_price, 254.82);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');

    assert.strictEqual(items[1].sku, 'TV');
    assert.strictEqual(items[1].qty, 5);
    assert.strictEqual(items[1].unit_price, 144.57);
    assert.typeOf(items[1].created, 'Date');
    assert.typeOf(items[1].modified, 'Date');

    assert.strictEqual(items[2].sku, 'WATER');
    assert.strictEqual(items[2].qty, 2);
    assert.strictEqual(items[2].unit_price, 2.45);
    assert.typeOf(items[2].created, 'Date');
    assert.typeOf(items[2].modified, 'Date');
  });


  it('should remove the DESK item from the cart', async function() {
    assert.strictEqual(await cart.removeItem('DESK'), true);

    let items = cart.getItems();
    let count = cart.itemCount();

    assert.strictEqual(count, 2);

    assert.strictEqual(items[0].sku, 'TV');
    assert.strictEqual(items[0].qty, 5);
    assert.strictEqual(items[0].unit_price, 144.57);
    assert.typeOf(items[0].created, 'Date');
    assert.typeOf(items[0].modified, 'Date');

    assert.strictEqual(items[1].sku, 'WATER');
    assert.strictEqual(items[1].qty, 2);
    assert.strictEqual(items[1].unit_price, 2.45);
    assert.typeOf(items[1].created, 'Date');
    assert.typeOf(items[1].modified, 'Date');
  });

  it('should empty all items from the cart', async function() {
    await cart.emptyAllItems();

    assert.isEmpty(cart.getItems());
    assert.strictEqual(cart.itemCount(), 0);
  });
});
