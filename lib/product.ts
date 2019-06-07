import EcomClient from './index';

type imageData = {
  uuid: string,
  sku: string,
  path: string,
  gsurl: string,
  width: number,
  height: number,
  size: number,
  created: string | Date,
  modified: string | Date
};

class Image {
  client: EcomClient;
  uuid: string;
  sku: string;
  path: string;
  gsurl: string;
  width: number;
  height: number;
  size: number;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, uuid: string, sku: string,
    path: string, gsurl: string, width: number, height: number, size: number, created: Date, modified: Date) {
    this.client = client;
    this.uuid = uuid;
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

type productData = {
  summary: string,
  description: string,
  specification: string
};

type productResponseData = {
  sku: string,
  ean: string,
  path: string,
  name: string,
  data: productData,
  images: imageData[],
  created: string | Date,
  modified: string | Date
};

class Product {
  client: EcomClient;
  sku: string;
  ean: string | undefined;
  path: string;
  name: string | undefined;
  data: productData | undefined;
  images: Image[];
  created: Date | undefined;
  modified: Date | undefined;
  loaded: boolean;

  constructor(client: EcomClient, sku: string, path: string, name: string) {
    this.client = client;
    this.sku = sku;
    this.path = path;
    this.name = name;
    this.images = [];
    this.loaded = false;
  }

  getImages() : Image[] {
    return this.images;
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
        this.ean = data.ean;
        this.path = data.path;
        this.name = data.name;
        this.data = data.data;
        this.created = new Date(data.created);
        this.modified = new Date(data.modified);
        this.images = [];

        for (let i = 0; i < data.images.length; i++) {
          let d = data.images[i];
          let img = new Image(this.client, d.uuid, d.sku, d.path, d.gsurl,
            d.width, d.height, d.size, new Date(d.created), new Date(d.modified))
          this.images.push(img);
        }
        this.loaded = true;
      }
    } catch (err) {
      throw err;
    }
  }

  unload() {
    this.loaded = false;
    this.ean = undefined;
    this.path = '';
    this.name = undefined;
    this.data = undefined;
    this.images = [];
  }
}
export default Product;