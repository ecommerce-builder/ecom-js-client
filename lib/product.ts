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
}

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
  path: string | undefined;
  name: string | undefined;
  data: productData | undefined;
  images: Image[];
  created: Date | undefined;
  modified: Date | undefined;
  loaded: boolean;

  constructor(client: EcomClient, sku: string) {
    this.client = client;
    this.sku = sku;
    this.images = [];
    this.loaded = false;
  }

  async load(forceLoad = false) {
    try {
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
        let response: productResponseData = await res.json();
        this.ean = response.ean;
        this.path = response.path;
        this.name = response.name;
        this.data = response.data;
        this.created = new Date(response.created);
        this.modified = new Date(response.modified);
        this.images = [];
        for (let i = 0; i < response.images.length; i++) {
          let d = response.images[i];
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
    this.path = undefined;
    this.name = undefined;
    this.data = undefined;
    this.images = [];
  }
}
export default Product;