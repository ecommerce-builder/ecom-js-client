import EcomClient from './index';
import Category from './category';
import Price from './price';

type imageData = {
  id: string,
  sku: string,
  path: string,
  gsurl: string,
  width: number,
  height: number,
  size: number,
  created: string | Date,
  modified: string | Date
};

type priceDataMap = {[key: string]: priceData};

type priceData = {
  unit_price: number,
  created: string,
  modified: string
}

class Image {
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


type productContent = {
  summary: string,
  description: string,
  specification: string
};

type productResponseData = {
  sku: string,
  ean: string,
  path: string,
  name: string,
  content: productContent,
  images: imageData[],
  pricing: priceDataMap,
  created: string | Date,
  modified: string | Date
};

type PricingMap = {[key: string]: Price}

class Product {
  client: EcomClient;
  sku: string;
  ean: string | undefined;
  path: string;
  name: string | undefined;
  content: productContent | undefined;
  images: Image[];
  pricing: PricingMap;
  created: Date | undefined;
  modified: Date | undefined;
  loaded: boolean;

  constructor(client: EcomClient, sku: string, path: string, name: string) {
    this.client = client;
    this.sku = sku;
    this.path = path;
    this.name = name;
    this.content = undefined;
    this.images = [];
    this.pricing = {};
    this.loaded = false;
  }

  getImages() : Image[] {
    return this.images;
  }

  getPricing() : PricingMap {
    return this.pricing;
  }

  async load(forceLoad = false) {
    try {
      // only load the product data once unless forceLoad is true
      // in which case force a reload.
      if ((this.loaded) && (!forceLoad)) {
        return;
      }

      let res = await this.client.get(`${this.client.endpoint}/products/${this.sku}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let data: productResponseData = await res.json();
        if (this.client.debug) {
          console.log(data);
        }
        this.ean = data.ean;
        this.path = data.path;
        this.name = data.name;
        this.content = data.content;
        this.created = new Date(data.created);
        this.modified = new Date(data.modified);

        // images
        this.images = [];
        for (let i = 0; i < data.images.length; i++) {
          let d = data.images[i];
          let img = new Image(this.client, d.id, d.sku, d.path, d.gsurl,
            d.width, d.height, d.size, new Date(d.created), new Date(d.modified))
          this.images.push(img);
        }

        // pricing
        this.pricing = {};
        Object.keys(data.pricing).forEach((tierRef) => {
          let p = data.pricing[tierRef];
          this.pricing[tierRef] = new Price(p.unit_price, new Date(p.created), new Date(p.modified));
        });

        this.loaded = true;
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

  unload() {
    this.loaded = false;
    this.ean = undefined;
    this.path = '';
    this.name = undefined;
    this.content = undefined;
    this.images = [];
    this.pricing = {};
  }
}

export default Product;
