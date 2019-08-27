import EcomClient from './index';

class CartItem {
  client: EcomClient;
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, sku: string, name: string, qty: number, unitPrice: number, created: Date, modified: Date) {
    this.client = client;
    this.sku = sku;
    this.name = name;
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

        this.qty = qty;
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
        this.sku = '';
        this.name = '';
        this.qty = 0;
        this.unitPrice = 0;

        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

}

export default CartItem;
