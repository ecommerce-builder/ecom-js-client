import { Cart } from './cart';
import { Customer } from './customer';
import { Catalog } from './catalog';
import { Db } from './db';
import { openDB } from 'idb';
import fetch from 'cross-fetch';
import { Auth } from './auth';

import { FirebaseOptions } from '@firebase/app-types';

export interface EcomClientOptions {
  endpoint: string,
  firebaseConfig: FirebaseOptions
  imageBaseURL?: string
  debug?: boolean
  fetch?: any
};

export class EcomClient {
  endpoint: string;
  firebaseConfig: FirebaseOptions
  _token: string | undefined;
  imageBaseURL: string;
  catalog: Catalog | null;
  customer: Customer | null;
  cart: Cart | null;
  auth: Auth;
  db: Db;
  fetch: any;
  dbPromise: any;
  debug: boolean;

  constructor(opts: EcomClientOptions) {
    this.endpoint = opts.endpoint;
    this.firebaseConfig = opts.firebaseConfig;
    this._token = undefined;
    this.imageBaseURL = opts.imageBaseURL || '';
    this.catalog = null;
    this.customer = null;
    this.cart = null;
    this.db = new Db(this);
    this.auth = new Auth(this);
    this.dbPromise = undefined;
    this.fetch = opts.fetch || fetch;
    this.debug = opts.debug || false;
  }

  static version() {
      return 'ECOM_VERSION';
  }

  static initApp(opts: EcomClientOptions): EcomClient {
    return new EcomClient(opts);
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

  setDebugMode(mode : boolean) {
    this.debug = mode;
  }

  setJWT(token: string) : void {
    this._token = token;
  }

  setImageBaseURL(url: string) : void {
    this.imageBaseURL = url;
  }

  getImageBaseURL() : string {
    return this.imageBaseURL;
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
        'Authorization': `Bearer ${this._token}`,
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
    if (this.debug) {
      console.log(`fetch url=${url}`);
      console.dir(opts);
    }
    return await this.fetch(`${this.endpoint}${url}`, opts);
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
}

// tslint:disable-next-line:no-default-export
export default EcomClient;
