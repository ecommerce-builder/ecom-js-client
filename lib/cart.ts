import EcomClient from './index';
import CartItem from './cart-item';

class Cart {
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
      let i = new CartItem(this.client, item.sku, item.name, item.qty, item.unit_price, new Date(item.created), new Date(item.modified));
      items.push(i);
    });
    this.items = items;
    return items;
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
   * @param {string} sku
   * @param {number} qty
   */
  async addItem(sku: string, qty: number) {
    try {
      const res = await this.client.post(`${this.client.endpoint}/carts/${this.id}/items`, {sku, qty});
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      let data = await res.json();
      this.items.push(new CartItem(this.client,
        data.sku, data.name, data.qty, data.unit_price, new Date(data.created), new Date(data.modified)));
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

export default Cart;
