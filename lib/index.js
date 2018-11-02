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
}

module.exports = EcomClient;