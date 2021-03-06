import EcomClient from './index';

export class CartItem {
  client: EcomClient;
  sku: string;
  qty: number;
  unitPrice: number;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, sku: string, qty: number, unitPrice: number, created: Date, modified: Date) {
    this.client = client;
    this.sku = sku;
    this.qty = qty;
    this.unitPrice = unitPrice;
    this.created = created;
    this.modified = modified;
  }

  async updateQty(qty: number) {
    try {
      if (!this.client.cart) {
        throw Error('No cart object');
      }
      let res = await this.client.patch(`${this.client.endpoint}/carts/${this.client.cart.id}/items/${this.sku}`, { qty });
      if (res.status === 200) {
        let data = await res.json();
        delete data.id;
        data.created = new Date(data.created);
        data.modified = new Date(data.modified);
        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async delete() {
    try {
      if (!this.client.cart) {
        throw Error('No cart object');
      }
      let res = await this.client.delete(`${this.client.endpoint}/carts/${this.client.cart.id}/items/${this.sku}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 204) {
        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

}

export class Cart {
  client: EcomClient;
  id: string;
  items: CartItem[]

  constructor(client: EcomClient, id: string) {
    this.client = client;
    this.id = id;
    this.items = [];
  }

  async getItems() : Promise<CartItem[]> {
    const res = await this.client.get(`${this.client.endpoint}/carts/${this.id}/items`);
    if (res.status >= 400) {
      let data = await res.json();
      let e = Error(data.message)
      throw e;
    }
    let data = await res.json();

    let items: CartItem[] = [];
    data.items.forEach((item: {sku: string; name: string; qty: number; unit_price: number; created: string, modified: string }) => {
      let i = new CartItem(this.client, item.sku, item.qty, item.unit_price, new Date(item.created), new Date(item.modified));
      items.push(i);
    });
    this.items = items;
    return items;
  }

  getCartId() : string{
    return this.id;
  }

  findItem(sku: string) : object | null {
    for (let item of this.items) {
      if (item.sku === sku) {
        return item;
      }
    }
    return null;
  }

  countItems() : number {
    let count = 0;
    this.items.forEach((i) => {
      count += i.qty;
    });
    return count;
  }

  /**
   * Adds an item to the shopping cart
   * @param {string} productId
   * @param {number} qty
   */
  async addItem(productId: string, qty: number) {
    try {
      const res = await this.client.post(`${this.client.endpoint}/carts/${this.id}/items`, {
        product_id: productId,
        qty: qty
      });

      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      let data = await res.json();
      const cartItem = new CartItem(this.client, data.sku, data.qty, data.unit_price, new Date(data.created), new Date(data.modified));

      this.items.push(cartItem);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async emptyAllItems() {
    try {
      let res = await this.client.delete(`${this.client.endpoint}/carts/${this.id}/items`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 204) {
        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
