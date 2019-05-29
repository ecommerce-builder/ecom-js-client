class Cart {
  client: EcomClient;
  uuid: string;
  items: any[];

  constructor(client: EcomClient, uuid: string) {
    this.client = client;
    this.uuid = uuid;
    this.items = [];
  }

  getItems() {
    return this.items;
  }

  countItems() {
    return this.items.length;
  }

  /**
   * Adds an item to the shopping cart
   * @param {string} sku
   * @param {number} qty
   */
  async addItem(sku: string, qty: number) {
    try {
      let res = await this.client.post(`${this.client.endpoint}/carts/${this.uuid}/items`, {sku, qty});
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      let data = await res.json();

      // drop the uuid property and convert created and modified to
      // native JS Date datatypes
      delete data.uuid;
      data.created = new Date(data.created);
      data.modified = new Date(data.modified);
      this.items.push(data);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async removeItem(sku: string) {
    // TODO: prevent empty value for sku otherwise it'll empty the entire cart items
    try {
      let res = await this.client.delete(`${this.client.endpoint}/carts/${this.uuid}/items/${sku}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 204) {
        // remove this item from the local cart items
        this.items = this.items.filter(i => {
          if (i.sku !== sku) return i;
        });
        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async updateItemQty(sku: string, qty: number) {
    try {
      let res = await this.client.patch(`${this.client.endpoint}/carts/${this.uuid}/items/${sku}`, { qty });
      if (res.status === 200) {
        let data = await res.json();
        delete data.uuid;
        data.created = new Date(data.created);
        data.modified = new Date(data.modified);
        this.items = this.items.map(i => {
          if (i.sku === sku) {
            return Object.assign({}, i, data);
          }

          return i;
        });

        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async emptyAllItems() {
    try {
      let res = await this.client.delete(`${this.client.endpoint}/carts/${this.uuid}/items`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 204) {
        // remove this item from the local cart items
        this.items = [];
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}


class Address {
  client: EcomClient;
  uuid: string;
  typ: string;
  contactName: string;
  addr1: string;
  addr2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  created: Date;
  modified: Date;

  /**
   * @param {string} client reference to the EcomClient instance
   * @param {string} typ          'billing' or 'shipping'
   * @param {string} uuid         address UUID
   * @param {string} contactName
   * @param {string} addr1
   * @param {string} addr2
   * @param {string} city
   * @param {string} county
   * @param {string} postcode
   * @param {string} country      2 digit country code
   * @param {Date}   created
   * @param {Date}   modified
   */
  constructor(client: EcomClient, uuid: string, typ: string, contactName: string, addr1: string, addr2: string, city: string, county: string, postcode: string, country: string, created: Date, modified: Date) {
    this.client = client;
    this.uuid = uuid;
    this.typ = typ;
    this.contactName = contactName;
    this.addr1 = addr1;
    this.addr2 = addr2;
    this.city = city;
    this.county = county;
    this.postcode = postcode;
    this.country = country;
    this.created = created;
    this.modified = modified;
  }

  async delete() {
    try {
      let res = await this.client.delete(`${this.client.endpoint}/addresses/${this.uuid}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }
      if (res.status === 204) {
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

class Customer {
  client: EcomClient;
  uuid: string;
  uid: string;
  email: string;
  firstname: string;
  lastname: string;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, uuid: string, uid: string, email: string, firstname: string, lastname: string, created: Date, modified: Date) {
    this.client = client;
    this.uuid = uuid;
    this.uid = uid;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
    this.created = created;
    this.modified = modified;
  }

  /**
   * Create an address for a customer
   * @param {string} typ
   * @param {string} contactName
   * @param {string} addr1
   * @param {string} addr2
   * @param {string} city
   * @param {string} county
   * @param {string} postcode
   * @param {string} country
   * @returns {Address}
   */
  async createAddress(typ: string, contactName: string, addr1: string, addr2: string, city: string, county: string, postcode: string, country: string) {
    try {
      let res = await this.client.post(`${this.client.endpoint}/customers/${this.uuid}/addresses`, {
        typ,
        contact_name: contactName,
        addr1,
        addr2,
        city,
        county,
        postcode,
        country,
      });
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 201) {
        let data = await res.json();
        return new Address(
          this.client,
          data.uuid,
          data.typ,
          data.contact_name,
          data.addr1,
          data.addr2,
          data.city,
          data.county,
          data.postcode,
          data.country,
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

  /**
   * Get address by UUID
   * @param {string}   uuid address UUID
   * @return {Address}
   */
  async getAddress(uuid: string) : Promise<Address | null> {
    try {
      let res = await this.client.get(`${this.client.endpoint}/addresses/${uuid}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let data = await res.json();
        return new Address(
          this.client,
          data.uuid,
          data.typ,
          data.contact_name,
          data.addr1,
          data.addr2,
          data.city,
          data.county,
          data.postcode,
          data.country,
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

  async getAddresses() {
    try {
      let res = await this.client.get(`${this.client.endpoint}/customers/${this.uuid}/addresses`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let data = await res.json();
        return data.map(i => {
          return new Address(
            this.client,
            i.uuid,
            i.typ,
            i.contact_name,
            i.addr1,
            i.addr2,
            i.city,
            i.county,
            i.postcode,
            i.country,
            new Date(i.created),
            new Date(i.modified)
          );
        });
      }
      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

class Image {
  client: EcomClient;
  uuid: string;
  sku: string;
  path: string;
  gsurl: string;
  width: number;
  height: number;
  size: number;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, uuid: string, sku: string,
    path: string, gsurl: string, width: number, height: number, size: number, created: Date, modified: Date) {
    this.client = client;
    this.uuid = uuid;
    this.sku = sku;
    this.path = path;
    this.gsurl = gsurl;
    this.width = width;
    this.height = height;
    this.size = size;
    this.created = created;
    this.modified = modified;
  }
}

type imageData = {
  uuid: string,
  sku: string,
  path: string,
  gsurl: string,
  width: number,
  height: number,
  size: number,
  created: string | Date,
  modified: string | Date
}
type productData = {
  summary: string,
  description: string,
  specification: string
};

type productResponseData = {
  sku: string,
  ean: string,
  path: string,
  name: string,
  data: productData,
  images: imageData[],
  created: string | Date,
  modified: string | Date
};

class Product {
  client: EcomClient;
  sku: string;
  ean: string | undefined;
  path: string | undefined;
  name: string | undefined;
  data: productData | undefined;
  images: Image[];
  created: Date | undefined;
  modified: Date | undefined;
  loaded: boolean;

  constructor(client: EcomClient, sku: string) {
    this.client = client;
    this.sku = sku;
    this.images = [];
    this.loaded = false;
  }

  async load(forceLoad = false) {
    try {
      if ((this.loaded) && (!forceLoad)) {
        return;
      }

      let res = await this.client.get(`${this.client.endpoint}/products/${this.sku}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }
      if (res.status === 200) {
        let response: productResponseData = await res.json();
        this.ean = response.ean;
        this.path = response.path;
        this.name = response.name;
        this.data = response.data;
        this.created = new Date(response.created);
        this.modified = new Date(response.modified);
        this.images = [];
        for (let i = 0; i < response.images.length; i++) {
          let d = response.images[i];
          let img = new Image(this.client, d.uuid, d.sku, d.path, d.gsurl,
            d.width, d.height, d.size, new Date(d.created), new Date(d.modified))
          this.images.push(img);
        }
        this.loaded = true;
      }
    } catch (err) {
      throw err;
    }
  }

  unload() {
    this.loaded = false;
    this.ean = undefined;
    this.path = undefined;
    this.name = undefined;
    this.data = undefined;
    this.images = [];
  }
}

class Category {
  client: EcomClient;
  segment: string;
  path: string;
  name: string;
  parent: Category | null;
  products: Product[];
  categories: Category[];

  constructor(client: EcomClient, segment: string, path: string, name: string) {
    this.client = client;
    this.segment = segment;
    this.path = path;
    this.name = name;
    this.parent = null;
    this.products = [];
    this.categories = [];
  }

  appendProduct(product: Product) {
    this.products.push(product);
  }

  appendChild(category: Category) {
    category.parent = this;
    this.categories.push(category);
  }

  setParent(category: Category) {
    this.parent = category;
  }

  hasCategories() : boolean {
    return this.categories.length > 0;
  }

  async loadProducts(forceLoad = false) {
    if (!this.isLeaf()) {
      throw Error('cannot load products on non-leaf category');
    }
    this.products.forEach(function(product) {
      product.load(forceLoad);
    });
  }

  unloadProducts() {
    if (!this.isLeaf()) {
      throw Error('cannot load products on non-leaf category');
    }
    this.products.forEach(function(product) {
      product.unload();
    });
  }

  /**
   * Looks through the child categories to find
   * a matching segment. Runs in O(n) time.
   * @param {string} segment e.g 'shoes', 'widgets' etc
   */
  find(segment: string) : Category | null {
    if (!this.hasCategories()) {
      return null;
    }
    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].segment === segment) {
        return this.categories[i];
      }
    }
    return null;
  }

  isLeaf() : boolean {
    return this.categories.length === 0;
  }
}

class Catalog {
  client: EcomClient;
  root: Category | null;

  constructor(client: EcomClient) {
    this.client = client;
    this.root = null;
  }

  strDumpTree(category: Category) {
    let output = `segment: ${category.segment}\t path: ${category.path}\tname: ${category.name}\n`;
    for (let i = 0; i < category.categories.length; i++) {
      output += this.strDumpTree(category.categories[i]);
    }
    return output;
  }

  rootCategory() : Category | null {
    return this.root;
  }

  /**
   * Find a Category in the tree by path
   *
   * e.g. a/c/f/j/n
   * @returns {Category|null} object or null if not found
   */
  findCategoryByPath(path: string) : Category | null {
    if (this.root === null) {
      return null;
    }
    // example without leading forwardslash 'a/c/f/j/n'
    let segments = path.split('/');
    if (segments[0] !== this.root.segment) {
      return null;
    }

    let context : Category | null = this.root;
    for (let i = 1; i < segments.length; i++) {
      context = context.find(segments[i])
      if (context === null) {
        return null;
      }
    }
    return context;
  }

  async load() {
    function walkTree(client: EcomClient, n: Category, c: Category) {
      if (n.hasOwnProperty('products') && n.products.constructor === Array) {
        n.products.forEach(function(p) {
          c.appendProduct(new Product(client, p.sku));
        });
      }

      if (n.hasOwnProperty('categories')) {
        for (let i = 0; i < n.categories.length; i++) {
          let newN = n.categories[i];
          let newC = new Category(client, newN.segment, c.path + '/' + newN.segment, newN.name);
          c.appendChild(newC);
          walkTree(client, newN, newC);
        }
      }
    }

    try {
      let res = await this.client.get(`${this.client.endpoint}/catalog`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let tree = await res.json();
        this.root = new Category(this.client, tree.segment, tree.segment, tree.name);
        walkTree(this.client, tree, this.root);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

type ecomClientOptions = {
  endpoint: string
  token: string
  customerUUID: string | undefined
};

class EcomClient {
  endpoint: string;
  token: string;
  customerUUID: string | undefined;
  catalog: Catalog | null;

  constructor(opts: ecomClientOptions) {
    this.endpoint = opts.endpoint;
    this.token = opts.token;
    this.customerUUID = opts.customerUUID || undefined;
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

  getCustomerUUID() : string | undefined {
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
