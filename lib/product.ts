import EcomClient from './index';
import { Category } from './category';
// import { Price } from './price';

// type imageData = {
//   id: string,
//   sku: string,
//   path: string,
//   gsurl: string,
//   width: number,
//   height: number,
//   size: number,
//   created: string | Date,
//   modified: string | Date
// };

// type priceDataMap = {[key: string]: priceData};

// type priceData = {
//   unit_price: number,
//   created: string,
//   modified: string
// }

export class Image {
  client: EcomClient;
  id: string;
  sku: string;
  path: string;
  gsurl: string;
  width: number;
  height: number;
  size: number;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, id: string, sku: string,
    path: string, gsurl: string, width: number, height: number, size: number, created: Date, modified: Date) {
    this.client = client;
    this.id = id;
    this.sku = sku;
    this.path = path;
    this.gsurl = gsurl;
    this.width = width;
    this.height = height;
    this.size = size;
    this.created = created;
    this.modified = modified;
  }

  getImageURL() : string {
    return `${this.client.getImageBaseURL()}/${this.path}`;
  }
}


// type productContent = {
//   summary: string,
//   description: string,
//   specification: string
// };

type productResponseData = {
  id: string;
  path: string,
  sku: string,
  ean: string,
  name: string,
  created: string | Date,
  modified: string | Date
};


export class Product {
  client: EcomClient;
  id: string;
  path: string;
  sku: string;
  ean: string | undefined;
  name: string | undefined;
  created: Date | undefined;
  modified: Date | undefined;

  constructor(client: EcomClient, id: string, path: string, sku: string, ean: string, name: string) {
    this.client = client;
    this.id = id;
    this.path = path;
    this.sku = sku;
    this.ean = ean;
    this.name = name;
  }

  async load() {
    try {
      let res = await this.client.get(`${this.client.endpoint}/products/${this.sku}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let data: productResponseData = await res.json();
        if (this.client.debug) {
          console.dir(data);
        }

        this.id = data.id;
        this.path = data.path;
        this.sku = data.sku;
        this.ean = data.ean;
        this.name = data.name;
        this.created = new Date(data.created);
        this.modified = new Date(data.modified);
      }
    } catch (err) {
      throw err;
    }
  }

  categories() : Category[] {
    if (this.client.catalog !== null) {
      return this.client.catalog.productPathCategoriesMap[this.path];
    }
    return [];
  }
}
