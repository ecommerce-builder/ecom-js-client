class Cart {
  constructor(endpoint, token, cartUuid) {
    Object.assign(this, {
      _endpoint: endpoint,
      _token: token,
      cartUuid,
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
      let uri = `${this._endpoint}/carts/${this.cartUuid}/items`;
      let res = await fetch(uri, {
        method: 'POST',
        body: JSON.stringify({
          sku,
          qty
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
      });

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
      let uri = `${this._endpoint}/carts/${this.cartUuid}/items/${sku}`;
      let res = await fetch(uri, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
      });

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
      let uri = `${this._endpoint}/carts/${this.cartUuid}/items/${sku}`;
      let res = await fetch(uri, {
        method: 'PATCH',
        body: JSON.stringify({
          qty
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
      });

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
      let uri = `${this._endpoint}/carts/${this.cartUuid}/items`;
      let res = await fetch(uri, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
      });

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
   * @param {string} endpoint
   * @param {string} token        JSON Web Token from Firebase Auth
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
  constructor(endpoint, token, UUID, typ, contactName, addr1, addr2, city, county, postcode, country, created, modified) {
    Object.assign(this, {
      _endpoint: endpoint,
      _token: token,
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
      let uri = `${this._endpoint}/addresses/${this.UUID}`;
      let res = await fetch(uri, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
      });

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
   *
   * @param {string} endpoint
   * @param {string} token         JSON Web Token from Firebase Auth
   * @param {string} UUID
   * @param {string} uid
   * @param {string} email
   * @param {string} firstname
   * @param {string} lastname
   * @param {Date}   created
   * @param {Date}   modified
   */
  constructor(endpoint, token, UUID, uid, email, firstname, lastname, created, modified) {
    Object.assign(this, {
      _endpoint: endpoint,
      _token: token,
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
      let uri = `${this._endpoint}/customers/${this.UUID}/addresses`;
      let res = await fetch(uri, {
        method: 'POST',
        body: JSON.stringify({
          typ,
          contact_name: contactName,
          addr1,
          addr2,
          city,
          county,
          postcode,
          country,
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
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
          this._endpoint,
          this._token,
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
      let uri = `${this._endpoint}/addresses/${UUID}`;
      let res = await fetch(uri, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
      });

      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
        throw e;
      }

      if (res.status === 200) {
        let data = await res.json();
        return new Address(
          this._endpoint,
          this._token,
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
      let headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this._token}`,
      };
      let uri = `${this._endpoint}/customers/${this.UUID}/addresses`;
      let res = await fetch(uri, {
        method: 'GET',
        headers,
        mode: 'cors',
      });

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
            this._endpoint,
            this._token,
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
  constructor(sku) {
    Object.assign(this, {
      sku,
    });
  }
}

class Category {
  constructor(segment, path, name) {
    Object.assign(this, {
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

    console.log(stack);
  }
}

class Catalog {
  constructor(endpoint, token) {
    Object.assign(this, {
      _endpoint: endpoint,
      _token: token,
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
      let uri = `${this._endpoint}/catalog`;
      let res = await fetch(uri, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
      });

      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
        throw e;
      }

      if (res.status === 200) {
        let tree = await res.json();

        function walkTree(n, c) {
          if (n.hasOwnProperty('products') && n.products.constructor === Array) {
            n.products.forEach(function(p) {
              c.appendProduct(new Product(p.sku));
            });
          }

          if (n.hasOwnProperty('categories')) {
            for (let i = 0; i < n.categories.length; i++) {
              let newN = n.categories[i];
              let newC = new Category(newN.segment, c.path + '/' + newN.segment, newN.name);
              c.appendChild(newC);
              walkTree(newN, newC);
            }
          }
        }
        this._root = new Category(tree.segment, tree.segment, tree.name);
        walkTree(tree, this._root);
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
      _endpoint: opts.endpoint,
      _token: opts.token || undefined,
      _customerUUID: opts.customerUUID | undefined,
      _catalog: undefined,
    });
  }

  static version() {
      return ECOM_VERSION;
  }

  setJWT(token) {
    this._token = token;
  }

  setCustomerUUID(UUID) {
    this._customerUUID = UUID;
  }

  getCustomerUUID() {
    return this._customerUUID;
  }

  /**
   * Create a new Catalog
   *
   */
  createCatalog() {
    this._catalog = new Catalog(this._endpoint, this._token);
    return this._catalog;
  }

  getCatalog() {
    return this._catalog;
  }

  async createCart() {
    try {
      let uri = `${this._endpoint}/carts`;
      let res = await fetch(uri, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Length': '0',
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
      });

      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
        throw e;
      }

      let data = await res.json();
      return new Cart(this._endpoint, this._token, data.uuid)
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Create a new customer
   *
   * @param {string} email
   * @param {string} password
   * @param {string} firstname
   * @param {string} lastname
   * @returns {object|null}
   *
   */
  async createCustomer(email, password, firstname, lastname) {
    try {
      let uri = `${this._endpoint}/customers`;
      let res = await fetch(uri, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstname,
          lastname,
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._token}`,
        },
        mode: 'cors',
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
          this._endpoint,
          this._token,
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
        this._endpoint,
        this._token,
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
