class Cart {
  constructor(client, uuid) {
    Object.assign(this, {
      client,
      uuid,
      items: [],
    });
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
  async addItem(sku, qty) {
    try {
      let res = await this.client.post(`${this.client.endpoint}/carts/${this.uuid}/items`, {sku, qty});
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
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

  async removeItem(sku) {
    // TODO: prevent empty value for sku otherwise it'll empty the entire cart items
    try {
      let res = await this.client.delete(`${this.client.endpoint}/carts/${this.uuid}/items/${sku}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
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

  async updateItemQty(sku, qty) {
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
        e.code = data.status;
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
  /**
   * @param {string} client reference to the EcomClient instance
   * @param {string} typ          'billing' or 'shipping'
   * @param {string} UUID         address UUID
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
  constructor(client, UUID, typ, contactName, addr1, addr2, city, county, postcode, country, created, modified) {
    Object.assign(this, {
      client,
      UUID,
      typ,
      contactName,
      addr1,
      addr2,
      city,
      county,
      postcode,
      country,
      created,
      modified,
    });
  }

  async delete() {
    try {
      let res = await this.client.delete(`${this.client.endpoint}/addresses/${this.UUID}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
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
  /**
   * @param {string} client reference to the EcomClient instance
   * @param {string} UUID
   * @param {string} uid
   * @param {string} email
   * @param {string} firstname
   * @param {string} lastname
   * @param {Date}   created
   * @param {Date}   modified
   */
  constructor(client, UUID, uid, email, firstname, lastname, created, modified) {
    Object.assign(this, {
      client,
      UUID,
      uid,
      email,
      firstname,
      lastname,
      created,
      modified,
    });
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
  async createAddress(typ, contactName, addr1, addr2, city, county, postcode, country) {
    try {
      let res = await this.client.post(`${this.client.endpoint}/customers/${this.UUID}/addresses`, {
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
        e.code = data.status;
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
   * @param {string}   UUID address UUID
   * @return {Address}
   */
  async getAddress(UUID) {
    try {
      let res = await this.client.get(`${this.client.endpoint}/addresses/${UUID}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
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
      let res = await this.client.get(`${this.client.endpoint}/customers/${this.UUID}/addresses`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
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

class Product {
  constructor(client, sku) {
    Object.assign(this, {
      client,
      sku,
    });
  }
}

class Category {
  constructor(client, segment, path, name) {
    Object.assign(this, {
      client,
      segment,
      path,
      name,
      parent: null,
      products: [],
      categories: [],
    });
  }

  appendProduct(product) {
    this.products.push(product);
  }

  appendChild(category) {
    category.parent = this;
    this.categories.push(category);
  }

  setParent(category) {
    this.parent = category;
  }

  hasCategories() {
    return this.categories.length > 0;
  }

  /**
   * Looks through the child categories to find
   * a matching segment. Runs in O(n) time.
   * @param {string} segment e.g 'shoes', 'widgets' etc
   */
  find(segment) {
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

  isLeaf() {
    return this.categories.length === 0;
  }

  /**
   * Return an array of Category objects including this category to the root category
   * @return {Array} an array of Category objects leading back to the root category inclusive
   */
  getAncesterCategories() {
    let stack = [];
    let current = this;
    while (current.parent !== null) {
      stack.push(current);
      current = current.parent;
    }
  }
}

class Catalog {
  constructor(client) {
    Object.assign(this, {
      client,
      _root: null,
    });
  }

  strDumpTree(category) {
    let output = `segment: ${category.segment}\t path: ${category.path}\tname: ${category.name}\n`;
    for (let i = 0; i < category.categories.length; i++) {
      output += this.strDumpTree(category.categories[i]);
    }
    return output;
  }

  rootCategory() {
    return this._root;
  }

  /**
   * Find a Category in the tree by path
   *
   * e.g. a/c/f/j/n
   * @returns {Category|null} object or null if not found
   */
  findCategoryByPath(path) {
    // example without leading forwardslash 'a/c/f/j/n'
    let segments = path.split('/');
    if (segments[0] !== this._root.segment) {
      return null;
    }

    let context = this._root;
    for (let i = 1; i < segments.length; i++) {
      context = context.find(segments[i])
      if (context === null) {
        return null;
      }
    }
    return context;
  }

  async load() {
    try {
      let res = await this.client.get(`${this.client.endpoint}/catalog`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
        throw e;
      }

      if (res.status === 200) {
        let tree = await res.json();

        function walkTree(client, n, c) {
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
        this._root = new Category(this.client, tree.segment, tree.segment, tree.name);
        walkTree(this.client, tree, this._root);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

class EcomClient {
  constructor(opts) {
    Object.assign(this, {
      endpoint: opts.endpoint,
      token: opts.token || undefined,
      _customerUUID: opts.customerUUID | undefined,
      catalog: undefined,
    });
  }

  static version() {
      return ECOM_VERSION;
  }

  setJWT(token) {
    this.token = token;
  }

  setCustomerUUID(UUID) {
    this._customerUUID = UUID;
  }

  getCustomerUUID() {
    return this._customerUUID;
  }

  async get(url) {
    return this.do(url, 'GET');
  }

  async post(url, body) {
    return this.do(url, 'POST', body);
  }

  async put(url, body) {
    return this.do(url, 'PUT', body);
  }

  async patch(url, body) {
    return this.do(url, 'PATCH', body);
  }

  async delete(url) {
    return this.do(url, 'DELETE');
  }

  async do(url, method, body) {
    let opts = {
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
  createCatalog() {
    this.catalog = new Catalog(this);
    return this.catalog;
  }

  getCatalog() {
    return this.catalog;
  }

  async createCart() {
    try {
      let res = await this.post(`${this.endpoint}/carts`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
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
  async createCustomer(email, password, firstname, lastname) {
    try {
      let res = await this.post(`${this.endpoint}/customers`, {
        email,
        password,
        firstname,
        lastname,
      });
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
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

  async makeCustomer(userCredential) {
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
        Date.now(),
        Date.now(),
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = EcomClient;
