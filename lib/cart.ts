import EcomClient from './index';

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

export default Cart;
