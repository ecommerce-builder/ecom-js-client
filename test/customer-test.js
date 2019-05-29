const chai = require('chai');
chai.use(require('chai-uuid'));
const assert = chai.assert;
const firebase = require('@firebase/app').default;
require('@firebase/auth');

//sslRootCAs = require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
//sslRootCAs.inject();

const fetch = require('node-fetch');
global.fetch = fetch;

const fbConfig = require('../firebase-config.json');

EcomClient = require('../dist/index.cjs');

const TEST_ENDPOINT = process.env.TEST_ENDPOINT;
var userCredential;
var ecom;
var customer;
var addrA; // ecom.Address type
var addrB;
var addrC;

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = 'secretsauce';

var userCredential;
var idTokenResult;

describe('Customer', async () => {
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

  it('should create a new customer', async function() {
    let c = await ecom.createCustomer(TEST_EMAIL, TEST_PASSWORD, "Joe", "Bloggs");
    assert.uuid(c.uuid, 'v4');
    assert.strictEqual(c.firstname, 'Joe');
    assert.strictEqual(c.lastname, 'Bloggs')
    assert.strictEqual(c.email, TEST_EMAIL)
    assert.typeOf(c.created, 'Date');
    assert.typeOf(c.modified, 'Date');
  });

  it('should sign-in using Firebase auth', async function() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(fbConfig);
      }

      userCredential = await firebase.auth().signInWithEmailAndPassword(TEST_EMAIL, TEST_PASSWORD);

      idTokenResult = await userCredential.user.getIdTokenResult();

      // save the JWT in the JS Client
      ecom.setJWT(idTokenResult.token);
      console.log(idTokenResult.token);
      ecom.setCustomerUUID(idTokenResult.claims.cuuid);

      customer = await ecom.makeCustomer(userCredential);
    } catch (err) {
      throw err;
    }
  });

  it('should create a new address A for the new customer', async function() {
    addrA = await customer.createAddress(
      'billing',
      'Adam Smith',
      '123 Timbuck Two Road',
      'Timbuck Two Lane',
      'Bristol',
      'South Gloucestershire',
      'BS8 2LG',
      'UK'
    );

    assert.uuid(addrA.uuid, 'v4');
    assert.strictEqual(addrA.typ, 'billing');
    assert.strictEqual(addrA.contactName, 'Adam Smith');
    assert.strictEqual(addrA.addr1, '123 Timbuck Two Road');
    assert.strictEqual(addrA.addr2, 'Timbuck Two Lane');
    assert.strictEqual(addrA.city, 'Bristol');
    assert.strictEqual(addrA.county, 'South Gloucestershire');
    assert.strictEqual(addrA.postcode, 'BS8 2LG');
    assert.strictEqual(addrA.country, 'UK');
    assert.typeOf(addrA.created, 'Date');
    assert.typeOf(addrA.modified, 'Date');
  });

  it('should create a new address B for the new customer', async function() {
    addrB = await customer.createAddress(
      'shipping',
      'Bob Jones',
      '456 Timbuck Two Road',
      'Timbuck Three Lane',
      'Cambridge',
      'Cambridgeshire',
      'CB25',
      'UK'
    );

    assert.uuid(addrB.uuid, 'v4');
    assert.strictEqual(addrB.typ, 'shipping');
    assert.strictEqual(addrB.contactName, 'Bob Jones');
    assert.strictEqual(addrB.addr1, '456 Timbuck Two Road');
    assert.strictEqual(addrB.addr2, 'Timbuck Three Lane');
    assert.strictEqual(addrB.city, 'Cambridge');
    assert.strictEqual(addrB.county, 'Cambridgeshire');
    assert.strictEqual(addrB.postcode, 'CB25');
    assert.strictEqual(addrB.country, 'UK');
    assert.typeOf(addrB.created, 'Date');
    assert.typeOf(addrB.modified, 'Date');
  });

  it('should create a new address C for the new customer', async function() {
    addrC = await customer.createAddress(
      'shipping',
      'Jacky Chan',
      '678 Sialong',
      'Paolo',
      'Kawloon',
      'Kalogonh',
      '2349D',
      'HK'
    );

    assert.uuid(addrC.uuid, 'v4');
    assert.strictEqual(addrC.typ, 'shipping');
    assert.strictEqual(addrC.contactName, 'Jacky Chan');
    assert.strictEqual(addrC.addr1, '678 Sialong');
    assert.strictEqual(addrC.addr2, 'Paolo');
    assert.strictEqual(addrC.city, 'Kawloon');
    assert.strictEqual(addrC.county, 'Kalogonh');
    assert.strictEqual(addrC.postcode, '2349D');
    assert.strictEqual(addrC.country, 'HK');
    assert.typeOf(addrC.created, 'Date');
    assert.typeOf(addrC.modified, 'Date');
  });

  it('should get an individual address', async function() {
    a = await customer.getAddress(addrA.uuid)

    assert.strictEqual(a.uuid, addrA.uuid);
    assert.uuid(a.uuid, 'v4');
    assert.strictEqual(a.typ, 'billing');
    assert.strictEqual(a.contactName, 'Adam Smith');
    assert.strictEqual(a.addr1, '123 Timbuck Two Road');
    assert.strictEqual(a.addr2, 'Timbuck Two Lane');
    assert.strictEqual(a.city, 'Bristol');
    assert.strictEqual(a.county, 'South Gloucestershire');
    assert.strictEqual(a.postcode, 'BS8 2LG');
    assert.strictEqual(a.country, 'UK');
    assert.typeOf(a.created, 'Date');
    assert.typeOf(a.modified, 'Date');
  });

  it('should get a list of existing addresses', async function() {
    list = await customer.getAddresses();

    assert.typeOf(list, 'Array');
    assert.lengthOf(list, 3);

    let a0 = list[0];

    assert.uuid(a0.uuid, 'v4');
    assert.strictEqual(a0.typ, 'shipping');
    assert.strictEqual(a0.contactName, 'Jacky Chan');
    assert.strictEqual(a0.addr1, '678 Sialong');
    assert.strictEqual(a0.addr2, 'Paolo');
    assert.strictEqual(a0.city, 'Kawloon');
    assert.strictEqual(a0.county, 'Kalogonh');
    assert.strictEqual(a0.postcode, '2349D');
    assert.strictEqual(a0.country, 'HK');
    assert.typeOf(a0.created, 'Date');
    assert.typeOf(a0.modified, 'Date');

    let a1 = list[1];
    assert.uuid(a1.uuid, 'v4');
    assert.strictEqual(a1.typ, 'shipping');
    assert.strictEqual(a1.contactName, 'Bob Jones');
    assert.strictEqual(a1.addr1, '456 Timbuck Two Road');
    assert.strictEqual(a1.addr2, 'Timbuck Three Lane');
    assert.strictEqual(a1.city, 'Cambridge');
    assert.strictEqual(a1.county, 'Cambridgeshire');
    assert.strictEqual(a1.postcode, 'CB25');
    assert.strictEqual(a1.country, 'UK');
    assert.typeOf(a1.created, 'Date');
    assert.typeOf(a1.modified, 'Date');

    let a2 = list[2];
    assert.strictEqual(a2.uuid, addrA.uuid);
    assert.uuid(a2.uuid, 'v4');
    assert.strictEqual(a2.typ, 'billing');
    assert.strictEqual(a2.contactName, 'Adam Smith');
    assert.strictEqual(a2.addr1, '123 Timbuck Two Road');
    assert.strictEqual(a2.addr2, 'Timbuck Two Lane');
    assert.strictEqual(a2.city, 'Bristol');
    assert.strictEqual(a2.county, 'South Gloucestershire');
    assert.strictEqual(a2.postcode, 'BS8 2LG');
    assert.strictEqual(a2.country, 'UK');
  });

  it('should delete existing addresses', async function() {
    await addrA.delete();
    await addrB.delete();
    await addrC.delete();
  });

  it('should get a list of existing addresses', async function() {
    list = await customer.getAddresses();

    assert.typeOf(list, 'Array');
    assert.lengthOf(list, 0);
  });

});
