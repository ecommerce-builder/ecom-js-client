const chai = require('chai');
const assert = chai.assert;
const firebase = require('@firebase/app').default;
require('@firebase/auth');

const fetch = require('node-fetch');
global.fetch = fetch;

const fbConfig = require('../firebase-config.json');

EcomClient = require('../lib/index');

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
      console.log(idTokenResult.token);
    } catch (err) {
        throw err;
    }
  });

  it('should load the nestedset', async function() {
    try {
      catalog = await ecom.createCatalog();

      assert.strictEqual(catalog._nestedset, undefined);

      await catalog.load();

      assert.isArray(catalog._nestedset);
      assert.lengthOf(catalog._nestedset, 14);
      let expected = [
        { id: 1, parent: null, name: 'a', uri: '/a', lft: 1, rgt: 28, dep: 0, },
        { id: 2, parent: 1, name: 'b', uri: '/a/b', lft: 2, rgt: 5, dep: 1, },
        { id: 3, parent: 2, name: 'e', uri: '/a/b/e', lft: 3, rgt: 4, dep: 2, },
        { id: 4, parent: 1, name: 'c', uri: '/a/c', lft: 6, rgt: 19, dep: 1, },
        { id: 5, parent: 4, name: 'f', uri: '/a/c/f', lft: 7, rgt: 16, dep: 2, },
        { id: 6, parent: 5, name: 'i', uri: '/a/c/f/i', lft: 8, rgt: 9, dep: 3, },
        { id: 7, parent: 5, name: 'j', uri: '/a/c/f/j', lft: 10, rgt: 15, dep: 3, },
        { id: 8, parent: 7, name: 'm', uri: '/a/c/f/j/m', lft: 11, rgt: 12, dep: 4, },
        { id: 9, parent: 7, name: 'n', uri: '/a/c/f/j/n', lft: 13, rgt: 14, dep: 4, },
        { id: 10, parent: 4, name: 'g', uri: '/a/c/g', lft: 17, rgt: 18, dep: 2, },
        { id: 11, parent: 1, name: 'd', uri: '/a/d', lft: 20, rgt: 27, dep: 1, },
        { id: 12, parent: 11, name: 'h', uri: '/a/d/h', lft: 21, rgt: 26, dep: 2, },
        { id: 13, parent: 12, name: 'k', uri: '/a/d/h/k', lft: 22, rgt: 23, dep: 3, },
        { id: 14, parent: 12, name: 'l', uri: '/a/d/h/l', lft: 24, rgt: 25, dep: 3, },
      ];

      catalog._nestedset.forEach(function(ns, i) {
        assert.deepInclude(ns, expected[i]);
      });
    } catch (err) {
      throw err;
    }
  });

  it('should build catalog hierarchy using internal nestedset', async function() {
    try {
      assert.strictEqual(catalog._rootCategory, null);
      catalog.build();
      assert.isObject(catalog._rootCategory);

      let rootCategory = catalog.rootCategory();
      assert.isObject(rootCategory);

      let expected = `name: a	 uri: /a	lft: 1	 rgt: 28
name: b	 uri: /a/b	lft: 2	 rgt: 5
name: e	 uri: /a/b/e	lft: 3	 rgt: 4
name: c	 uri: /a/c	lft: 6	 rgt: 19
name: f	 uri: /a/c/f	lft: 7	 rgt: 16
name: i	 uri: /a/c/f/i	lft: 8	 rgt: 9
name: j	 uri: /a/c/f/j	lft: 10	 rgt: 15
name: m	 uri: /a/c/f/j/m	lft: 11	 rgt: 12
name: n	 uri: /a/c/f/j/n	lft: 13	 rgt: 14
name: g	 uri: /a/c/g	lft: 17	 rgt: 18
name: d	 uri: /a/d	lft: 20	 rgt: 27
name: h	 uri: /a/d/h	lft: 21	 rgt: 26
name: k	 uri: /a/d/h/k	lft: 22	 rgt: 23
name: l	 uri: /a/d/h/l	lft: 24	 rgt: 25
`

      let output = catalog.strDumpTree(rootCategory);
      assert.strictEqual(output, expected);
    } catch (err) {
      throw err;
    }
  });


});
