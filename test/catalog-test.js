const chai = require('chai');
const assert = chai.assert;
const firebase = require('@firebase/app').default;
require('@firebase/auth');

const fetch = require('node-fetch');
global.fetch = fetch;

const fbConfig = require('../firebase-config.json');

EcomClient = require('../dist/index.cjs');

const TEST_ENDPOINT = process.env.TEST_ENDPOINT;
const TEST_EMAIL = process.env.TEST_EMAIL;


var catalog;

describe('Catalog', async () => {
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
    } catch (err) {
        throw err;
    }
  });

  it('should load the nestedset', async function() {
    try {
      catalog = await ecom.createCatalog();
      await catalog.load();

      //let expected = {
      //  { id: 1, parent: null, segment: 'a', path: 'a', name: 'ประเภท A', lft: 1, rgt: 28, depth: 0, },
      //  { id: 2, parent: 1, segment: 'b', path: 'a/b', name: 'ประเภท B', lft: 2, rgt: 5, depth: 1, },
      //  { id: 3, parent: 2, segment: 'e', path: 'a/b/e', name: 'ประเภท E', lft: 3, rgt: 4, depth: 2, },
      //  { id: 4, parent: 1, segment: 'c', path: 'a/c', name: 'ประเภท C', lft: 6, rgt: 19, depth: 1, },
      //  { id: 5, parent: 4, segment: 'f', path: 'a/c/f', name: 'ประเภท F', lft: 7, rgt: 16, depth: 2, },
      //  { id: 6, parent: 5, segment: 'i', path: 'a/c/f/i', name: 'ประเภท I', lft: 8, rgt: 9, depth: 3, },
      //  { id: 7, parent: 5, segment: 'j', path: 'a/c/f/j', name: 'ประเภท J', lft: 10, rgt: 15, depth: 3, },
      //  { id: 8, parent: 7, segment: 'm', path: 'a/c/f/j/m', name: 'ประเภท M', lft: 11, rgt: 12, depth: 4, },
      //  { id: 9, parent: 7, segment: 'n', path: 'a/c/f/j/n', name: 'ประเภท N', lft: 13, rgt: 14, depth: 4, },
      //  { id: 10, parent: 4, segment: 'g', path: 'a/c/g', name: 'ประเภท G', lft: 17, rgt: 18, depth: 2, },
      //  { id: 11, parent: 1, segment: 'd', path: 'a/d', name: 'ประเภท D', lft: 20, rgt: 27, depth: 1, },
      //  { id: 12, parent: 11, segment: 'h', path: 'a/d/h', name: 'ประเภท H', lft: 21, rgt: 26, depth: 2, },
      //  { id: 13, parent: 12, segment: 'k', path: 'a/d/h/k', name: 'ประเภท K', lft: 22, rgt: 23, depth: 3, },
      //  { id: 14, parent: 12, segment: 'l', path: 'a/d/h/l', name: 'ประเภท L', lft: 24, rgt: 25, depth: 3, },
      //};
    } catch (err) {
      throw err;
    }
  });

  it('should find a category within a category', function() {
    let root = catalog.getRootCategory();
    b = root.find('b');

    // should get back the b category node
    // segment: b	 path: /a/b	name: ประเภท B	lft: 2	 rgt: 5
    assert.isObject(b);
    assert.strictEqual(b.segment, 'b');
    assert.strictEqual(b.path, 'a/b');
    assert.strictEqual(b.name, 'ประเภท B');
  });

  it('should not find a category within a category', function() {
    let root = catalog.getRootCategory();

    z = root.find('z');

    // should not get back a non-existent category node
    assert.isNull(z);
  });

  it('should find a category by path', function() {
    try {
      let n = catalog.findCategoryByPath('a/c/f/j/n');

      // should get back the n category node
      // segment: n	 path: /a/c/f/j/n	name: ประเภท N	lft: 13	 rgt: 14
      assert.isObject(n);
      assert.strictEqual(n.segment, 'n');
      assert.strictEqual(n.path, 'a/c/f/j/n');
      assert.strictEqual(n.name, 'ประเภท N');

      // ensure we found a leaf node
      assert.strictEqual(n.isLeaf(), true);
    } catch (err) {
      throw err;
    }
  });

  it('should not find a category by path', function() {
    try {
      let x = catalog.findCategoryByPath('a/c/f/j/x');

      // should not get back a non-existent category node
      assert.isNull(x);
    } catch (err) {
      throw err;
    }
  });
});
