import EcomClient from './index';
import EcomError from './error';

// request payload for a PUT /price-lists/{id}
type updatePriceListRequestBody = {
  price_list_code: string
  currency_code: string
  readonly strategy: string
  inc_tax: boolean
  name: string
  description: string
}

// response for a price list object
type priceListResponseBody = {
  id: string
  price_list_code: string
  currency_code: string
  strategy: string
  inc_tax: boolean
  name: string
  description: string
  created: string
  modified: string
}

class PriceList {
  client: EcomClient;
  id: string;
  priceListCode: string;
  currencyCode: string;
  strategy: string;
  incTax: boolean;
  name: string;
  description: string;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, id: string, priceListCode: string, currencyCode: string, strategy: string, incTax: boolean, name: string, description: string, created: Date, modified: Date) {
    this.client = client;
    this.id = id;
    this.priceListCode = priceListCode;
    this.currencyCode = currencyCode;
    this.strategy = strategy;
    this.incTax = incTax;
    this.name = name;
    this.description = description;
    this.created = created;
    this.modified = modified;
  }

  async save() : Promise<void> {
    if (!this.id) {
      throw Error('cannot perform a save() method on a price list that has undefined properties');
    }

    const requestBody : updatePriceListRequestBody = {
      price_list_code: this.priceListCode,
      currency_code: this.currencyCode,
      strategy: this.strategy,
      inc_tax: this.incTax,
      name: this.name,
      description: this.description
    };

    let res = await this.client.put(`${this.client.endpoint}/price-lists/${this.id}`, requestBody);

    if (res.status >= 400) {
      let data = await res.json();
      let e = new EcomError(data.status, data.code, data.message);
      throw e;
    }

    if (res.status === 200) {
      let data : priceListResponseBody = await res.json();

      // update the local values as the server is the source of truth
      this.id = data.id;
      this.priceListCode = data.price_list_code;
      this.currencyCode = data.currency_code;
      this.strategy = data.strategy;
      this.incTax = data.inc_tax;
      this.name = data.name;
      this.description = data.description;
      this.created = new Date(data.created);
      this.modified = new Date(data.modified);

      return undefined;
    }
  }

  async delete() : Promise<void> {
    try {
      let res = await this.client.delete(`${this.client.endpoint}/price-lists/${this.id}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = new EcomError(data.status, data.code, data.message);
        throw e;
      }

      if (res.status === 204) {
        this.id = '';
        this.priceListCode = '';
        this.currencyCode = '';
        this.strategy = '';
        this.incTax = false;
        this.name = '';
        this.description = '';
        this.created = new Date(0);
        this.modified = new Date(0);
      }
    } catch (err) {
      throw err;
    }
  }

  toJSON() : string {
    const response = {
      id: this.id,
      price_list_code: this.priceListCode,
      currency_code: this.currencyCode,
      strategy: this.strategy,
      inc_tax: this.incTax,
      name: this.name,
      description: this.description,
      created: this.created.toISOString(),
      modified: this.modified.toISOString()
    };
    return JSON.stringify(response);
  }

  toString() : string {
    return `id: ${this.id}  price_list_code: ${this.priceListCode}  currency_code: ${this.currencyCode}  strategy: ${this.strategy}  inc_tax: ${this.incTax}  name: ${this.name}  description: ${this.description}  created: ${this.created.toString()}  modified: ${this.modified.toString()}`;
  }
}

export default PriceList;
