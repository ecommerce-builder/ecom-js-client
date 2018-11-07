'use strict';
const fetch = require('node-fetch');

class Cart {
  constructor(endpoint, cartUuid) {
    Object.assign(this, {
      _endpoint: endpoint,
      cartUuid,
      items: []
    });
  }

  getItems() {
    return this.items;
  }

  itemCount() {
    return this.items.length;
  }

  async addItem(sku, qty) {
    try {
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      let uri = `${this._endpoint}/carts/${this.cartUuid}/items`;
      let res = await fetch(uri, {
        method: 'POST',
        body: JSON.stringify({
          sku,
          qty
        }),
        headers,
        mode: 'cors'
      });

      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
        throw e;
      }

      let data = await res.json();

      // drop the cart_uuid property and convert created and modified to
      // native JS Date datatypes
      delete data.cart_uuid;
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
        mode: 'cors'
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
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      let uri = `${this._endpoint}/carts/${this.cartUuid}/items/${sku}`;
      let res = await fetch(uri, {
        method: 'PATCH',
        body: JSON.stringify({
          qty
        }),
        headers,
        mode: 'cors'
      });


      if (res.status === 200) {
        let data = await res.json();
        delete data.cart_uuid;
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
        mode: 'cors'
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
   * @param {string} typ         'billing' or 'shipping'
   * @param {string} addrUUID    address UUID
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
  constructor(endpoint, addrUUID, typ, contactName, addr1, addr2, city, county, postcode, country, created, modified) {
    Object.assign(this, {
      _endpoint: endpoint,
      addrUUID,
      typ,
      contactName,
      addr1,
      addr2,
      city,
      county,
      postcode,
      country,
      created,
      modified
    });
  }

  async delete() {
    try {
      let uri = `${this._endpoint}/addresses/${this.addrUUID}`;
      let res = await fetch(uri, {
        method: 'DELETE',
        mode: 'cors'
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
   * @param {string} customerUUID
   * @param {string} uid
   * @param {string} email
   * @param {string} firstname
   * @param {string} lastname
   * @param {Date}   created
   * @param {Date}   modified
   */
  constructor(endpoint, customerUUID, uid, email, firstname, lastname, created, modified) {
    Object.assign(this, {
      _endpoint: endpoint,
      customerUUID,
      uid,
      email,
      firstname,
      lastname,
      created,
      modified
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
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      let uri = `${this._endpoint}/customers/${this.customerUUID}/addresses`;
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
          country
        }),
        headers,
        mode: 'cors'
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
          data.addr_uuid,
          data.typ,
          data.contact_name,
          data.addr1,
          data.addr2,
          data.city,
          data.county,
          data.postcode,
          data.country,
          new Date(data.created),
          new Date(data.modified)
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
   * @param {string} addrUUID address UUID
   * @return {Address}
   */
  async getAddress(addrUUID) {
    try {
      let headers = {
        'Accept': 'application/json'
      };

      let uri = `${this._endpoint}/addresses/${addrUUID}`;
      let res = await fetch(uri, {
        method: 'GET',
        headers,
        mode: 'cors'
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
          data.addr_uuid,
          data.typ,
          data.contact_name,
          data.addr1,
          data.addr2,
          data.city,
          data.county,
          data.postcode,
          data.country,
          new Date(data.created),
          new Date(data.modified)
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
        'Accept': 'application/json'
      };
      let uri = `${this._endpoint}/customers/${this.customerUUID}/addresses`;
      let res = await fetch(uri, {
        method: 'GET',
        headers,
        mode: 'cors'
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
          return new Address(this._endpoint, i.addr_uuid, i.typ, i.contact_name, i.addr1, i.addr2, i.city, i.county, i.postcode, i.country, new Date(i.created), new Date(i.modified));
        });
      }

      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

class EcomClient {
  constructor(endpoint) {
    Object.assign(this, {
      _endpoint: endpoint
    });
  }

  async createCart() {
    try {
      let headers = {
        'Accept': 'application/json'
      };

      let uri = `${this._endpoint}/carts`;
      let res = await fetch(uri, {
        method: 'POST',
        headers,
        mode: 'cors'
      });

      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        e.code = data.status;
        throw e;
      }

      let data = await res.json();
      return new Cart(this._endpoint, data.cart_uuid)
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
      let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      let uri = `${this._endpoint}/customers`;
      let res = await fetch(uri, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstname,
          lastname
        }),
        headers,
        mode: 'cors'
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
          data.customer_uuid,
          data.uid,
          data.email,
          data.firstname,
          data.lastname,
          new Date(data.created),
          new Date(data.modified)
        );
      }

      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = EcomClient;