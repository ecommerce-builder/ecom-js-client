import EcomClient from './index';

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


export default Image;
