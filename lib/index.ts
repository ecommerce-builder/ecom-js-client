import Cart from './cart';
import Customer from './customer';
import Catalog from './catalog';
import Address from './address';
import Order from './order';

import { openDB } from 'idb';

const ECOM_FIREBASE_KEY_SERVER_URL = 'https://ecom-key-server.firebaseapp.com';

type ecomClientOptions = {
  endpoint: string
  token: string
  customerId: string
  imageBaseURL: string
  keyServerUrl?: string
};

class EcomClient {
  endpoint: string;
  token: string;
  customerId: string;
  imageBaseURL: string;
  catalog: Catalog | null;
  customer: Customer | null;
  cart: Cart | null;
  keyServerUrl: string | undefined;
  dbPromise: any;
  debug: boolean;

  constructor(opts: ecomClientOptions) {
    this.endpoint = opts.endpoint;
    this.token = opts.token;
    this.customerId = opts.customerId || '';
    this.imageBaseURL = opts.imageBaseURL || '';
    this.catalog = null;
    this.customer = null;
    this.cart = null;
    this.keyServerUrl = opts.keyServerUrl || ECOM_FIREBASE_KEY_SERVER_URL;
    this.dbPromise = undefined;
    this.debug = false;
  }

  static version() {
      return 'ECOM_VERSION';
  }

  async init(config: { uid: string; } ) {
    this.dbPromise = await openDB('ecomdb', 1, {
      upgrade(db : any) {
        if (!db.objectStoreNames.contains('carts')) {
          db.createObjectStore('carts', {
            keyPath: 'id',
            autoIncrement: false
          });
        }

        if (!db.objectStoreNames.contains('session')) {
          db.createObjectStore('session', {
            keyPath: 'name',
            autoIncrement: false
          });
        }
      }
    });
    await this.dbPromise.put('session', { name: 'currentUser', uid: config.uid });

    // load the catalog
    const catalog = this.createCatalog();
    await catalog.load(true);

    // If no cart has been created, then create one.
    const cart = await this.getCart();
    if (!cart) {
      await this.createCart();
    }
  }

  /**
   * Get the Firebase config based on the current URL
   *
   * @param {string} hostname e.g. test.example.com
   * @return {object} firebase config object
   */
  static async getFirebaseConfig(hostname: string) {
    if (!hostname) {
      const url = new URL(window.location.href);
      hostname = url.hostname
    }

    try {
      let uri = `${ECOM_FIREBASE_KEY_SERVER_URL}/${hostname}.json`;
      let res = await fetch(uri, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      if (res.status >= 400) {
          return null;
      }

      if (res.status === 200) {
        return await res.json();
      }

    } catch (err) {
      throw err;
    }
  }

  /**
   * Returns system info including Database, Google and App configuration.
   * @returns {Object}
   */
  async getSystemInfo() {
    try {
      let res = await this.get(`${this.endpoint}/sysinfo`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message);
        throw e;
      }

      if (res.status === 200) {
        let data = await res.json();
        if (this.debug) {
          console.dir(data);
        }
        return data;
      }
    } catch (err) {
      throw err;
    }
  }

  setDebugMode(mode : boolean) {
    this.debug = mode;
  }

  setJWT(token: string) : void {
    this.token = token;
  }

  setCustomerId(id: string) : void {
    this.customerId = id;
  }

  setImageBaseURL(url: string) : void {
    this.imageBaseURL = url;
  }

  getImageBaseURL() : string {
    return this.imageBaseURL;
  }

  getCustomerId() : string {
    return this.customerId;
  }

  async get(url: string) {
    return this.do(url, 'GET', null);
  }

  async post(url: string, body: object | null) : Promise<Response> {
    return this.do(url, 'POST', body);
  }

  async put(url: string, body: object | null) : Promise<Response> {
    return this.do(url, 'PUT', body);
  }

  async patch(url: string, body: object | null) : Promise<Response> {
    return this.do(url, 'PATCH', body);
  }

  async delete(url: string) : Promise<Response> {
    return this.do(url, 'DELETE', null);
  }

  async do(url: string, method: string, body: object | null) : Promise<Response> {
    let opts : any  = {
      method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      mode: 'cors',
    };

    if ((method == 'POST') && (!body)) {
      opts.headers['Content-Length'] = '0';
    }

    if (body) {
      opts.body = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
    }
    return await fetch(url, opts);
  }


  /**
   * Create a new Catalog
   *
   */
  createCatalog() : Catalog {
    this.catalog = new Catalog(this);
    return this.catalog;
  }

  getCatalog() : Catalog | null {
    return this.catalog;
  }

  async createCart() : Promise<Cart> {
    try {
      let res = await this.post(`${this.endpoint}/carts`, null);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      let data = await res.json();

      if (this.dbPromise) {
        const tx1 = this.dbPromise.transaction('carts', 'readwrite');
        const cartsDB = tx1.objectStore('carts');
        await cartsDB.put({ id: data.id });
        await tx1.complete;

        const tx2 = this.dbPromise.transaction('session', 'readwrite');
        const sessionDB = tx2.objectStore('session');
        await sessionDB.put({ name: 'currentCartId', id: data.id });
        await tx2.complete;
      }

      const cart = new Cart(this, data.id);
      this.cart = cart;
      return cart;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getCart() : Promise<Cart | null> {
    if (this.cart) {
      await this.cart.getItems();
      return this.cart;
    }

    try {
      if (this.dbPromise) {
        const tx = this.dbPromise.transaction('session', 'readonly');
        const sessionDB = tx.objectStore('session');
        const { id } = await sessionDB.get('currentCartId');
        if (id) {
          this.cart = new Cart(this, id);
          await this.cart.getItems();
          return this.cart;
        }
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  /**
   * Create a new customer
   * @param {string} email
   * @param {string} password
   * @param {string} firstname
   * @param {string} lastname
   * @returns {object|null}
   *
   */
  async createCustomer(email: string, password: string, firstname: string, lastname: string) : Promise<Customer | null> {
    try {
      let res = await this.post(`${this.endpoint}/customers`, {
        email,
        password,
        firstname,
        lastname,
      });
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message);
        throw e;
      }

      if (res.status === 201) {
        let data = await res.json();
        const customer = new Customer(
          this,
          data.id,
          data.uid,
          data.email,
          data.firstname,
          data.lastname,
          new Date(data.created),
          new Date(data.modified),
        );
        this.customer = customer;
        return customer;
      }

      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getCustomer(user: any) : Promise<Customer | null> {
    try {
      const idTokenResult = await user.getIdTokenResult();
      const id = idTokenResult.claims.cid;
      let res = await this.get(`${this.endpoint}/customers/${id}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message);
        throw e;
      }

      if (res.status === 200) {
        let data = await res.json();
        const customer = new Customer(this, id, data.uid, data.email, data.firstname, data.lastname,
          new Date(data.created), new Date(data.modified));
        this.customer = customer;
        return customer;
      }

      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async placeGuestOrder(contactName: string, email: string, cartId : string, billing: Address, shipping: Address,) : Promise<Order | null> {
    try {
      const res = await this.post(`${this.endpoint}/orders`, {
        contact_name: contactName,
        email,
        cart_id: cartId,
        billing_address: billing.toOrderObject(),
        shopping_address: shipping.toOrderObject()
      });

      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message);
        throw e;
      }

      if (res.status === 200) {
        let data = await res.json();

        const order = new Order(this,
          data.id,
          data.status,
          data.payment,
          data.customer.contact_name,
          data.customer.email,
          data.billing_address,
          data.shipping_address,
          new Date(data.created),
          new Date(data.modified)
        );

        return order;
      }

      return null;
    } catch (err) {
      throw err;
    }
  }
}

export default EcomClient;
