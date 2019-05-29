import Cart from './cart';
import Customer from './customer';
import Catalog from './catalog';

type ecomClientOptions = {
  endpoint: string
  token: string
  customerUUID: string
  imageBaseURL: string
};

class EcomClient {
  endpoint: string;
  token: string;
  customerUUID: string;
  imageBaseURL: string;
  catalog: Catalog | null;

  constructor(opts: ecomClientOptions) {
    this.endpoint = opts.endpoint;
    this.token = opts.token;
    this.customerUUID = opts.customerUUID || '';
    this.imageBaseURL = opts.imageBaseURL || '';
    this.catalog = null;
  }

  static version() {
      return 'ECOM_VERSION';
  }

  setJWT(token: string) : void {
    this.token = token;
  }

  setCustomerUUID(uuid: string) : void {
    this.customerUUID = uuid;
  }

  setImageBaseURL(url: string) : void {
    this.imageBaseURL = url;
  }

  getImageBaseURL() : string {
    return this.imageBaseURL;
  }

  getCustomerUUID() : string {
    return this.customerUUID;
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
      return new Cart(this, data.uuid)
    } catch (err) {
      console.error(err);
      throw err;
    }
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
        return new Customer(
          this,
          data.uuid,
          data.uid,
          data.email,
          data.firstname,
          data.lastname,
          new Date(data.created),
          new Date(data.modified),
        );
      }

      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async makeCustomer(userCredential: any) {
    try {
      let user = userCredential.user;
      let idTokenResult = await userCredential.user.getIdTokenResult();
      return new Customer(
        this,
        idTokenResult.claims.cuuid,
        user.uid,
        user.email,
        user.displayName.split(' ').slice(0, -1).join(' '),
        user.displayName.split(' ').slice(-1).join(' '),
        new Date(Date.now()),
        new Date(Date.now()),
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}


export default EcomClient;
