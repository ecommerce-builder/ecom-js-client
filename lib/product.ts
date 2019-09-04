import EcomClient from './index';
import { Category } from './category';
import { ProductInclude } from './db/product';
import { Price } from './price';
import { Image } from './image';

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



// type productContent = {
//   summary: string,
//   description: string,
//   specification: string
// };

export class Product {
  client: EcomClient;
  id: string;
  path: string;
  sku: string;
  prices: Price[] | undefined;
  images: Image[] | undefined;
  name: string | undefined;
  created: Date | undefined;
  modified: Date | undefined;

  constructor(client: EcomClient, id: string, path: string, sku: string, name: string, created: Date, modified: Date) {
    this.client = client;
    this.id = id;
    this.path = path;
    this.sku = sku;
    this.name = name;
    this.created = created;
    this.modified = modified;
  }

  async load() {
    try {
      const docSnap = await this.client.db.products
        .doc(this.id)
        .get(ProductInclude.Prices | ProductInclude.Images);

      if (docSnap.exists) {
        const data = docSnap.data();
        this.path = data.path;
        this.sku = data.sku;
        this.name = data.name;
        this.created = data.created;
        this.modified = data.modified;

        console.log('------------------------------------');
        console.dir(data);
        console.log('--------------------------------');

        if (data.prices) {
          const list: priceResponse[] = data.prices.data;

          // console.dir(list);
          // prices
          this.prices = [];
          interface priceResponse {
            id: string;
            product_id: string;
            product_path: string;
            product_sku: string;
            price_list_id: string
            price_list_code: string;
            break: number;
            unit_price: number;
            created: string
            modified: string
          }

          list.forEach(p => {
            const price = new Price(p.id, p.product_id, p.product_path, p.product_sku, p.price_list_id, p.price_list_code, p.break, p.unit_price, new Date(p.created), new Date(p.modified))
            if (this.prices) {
              this.prices.push(price);
            }
          });

          // images

        }
      }
    } catch (err) {
      throw err;
    }
  }

  categories(): Category[] {
    if (!this.client.categoryTree) {
      return [];
    }

    if (this.client.categoryTree !== null) {
      return this.client.categoryTree.productPathCategoriesMap[this.path];
    }
    return [];
  }
}
