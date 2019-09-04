import EcomClient from '..';
import { Query, CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import { EcomError } from './error';
import { PriceDocumentData } from './price';
import { ImageDocumentData } from './image';

export interface ProductDocumentData {
  path: string;
  sku: string
  name: string
  prices?: {
    object: string
    data: PriceDocumentData[]
  },
  images?: {
    object: string
    data: ImageDocumentData[]
  },
  created: Date
  modified: Date
}

interface SetProductDocumentData {
  path: string
  sku: string
  name: string
};

export enum ProductInclude {
  None = 0,
  Prices = 1 << 0, // 0001
  Images = 1 << 1, // 0010
}

export class ProductCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : ProductDocumentReference {
    return new ProductDocumentReference(this._ecom, id, this);
  }

  async add(product: SetProductDocumentData): Promise<ProductDocumentReference> {
    let response = await this._ecom.post('/products', {
      path: product.path,
      sku: product.sku,
      name: product.name
    });

    if (response.status >= 400) {
      let data = await response.json();
      throw new EcomError(data.status, data.code, data.message);
    }

    if (response.status === 201) {
      let data = await response.json();

      // const snapshotData: ProductDocumentData = {
      //   path: data.path,
      //   sku: data.sku,
      //   name: data.name,
      //   created: new Date(data.created),
      //   modified: new Date(data.modified)
      // };

      // const docSnap = new ProductDocumentSnapshot(data.id, snapshotData);
      const docRef = new ProductDocumentReference(this._ecom, data.id, this);
      return docRef;
    }

    throw Error('failed to add a new product');
  }

  async get(): Promise<QuerySnapshot> {
    try {
      let response = await this._ecom.get('/products');

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 200) {
        let data = await response.json();


        console.dir(data);

        // let docs: QueryDocumentSnapshot[] = [];
        // list.forEach((product: any) => {
        //   const docRef = new ProductDocumentReference(this._ecom, product.id, this);

        //   const productDocumentData: ProductDocumentData = {
        //     path: product.path,
        //     sku: product.sku,
        //     name: product.name,
        //     created: new Date(product.created),
        //     modified: new Date(product.modified)
        //   };

        //   let queryDocumentSnapshot = new ProductQueryDocumentSnapshot(docRef, productDocumentData);

        //   docs.push(queryDocumentSnapshot);
        // });
        // return new CategoryTreeQuerySnapshot(this, docs);
      }
      throw Error('failed to get product collection');
    } catch (err) {
      throw err;
    }
  }
}

export class ProductDocumentReference extends DocumentReference {
  constructor(client: EcomClient, id: string, parent: CollectionReference) {
    super(client, id, parent);
  }

  async set(product: SetProductDocumentData): Promise<void> {
    try {
      const response = await this._ecom.put(`/products/${this.id}`, {
        path: product.path,
        sku: product.sku,
        name: product.name
      });

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status >= 200) {
        //let data = await response.json();

        // const snapshotData: ProductDocumentData = {
        //   path: data.path,
        //   sku: data.sku,
        //   name: data.name,
        //   created: new Date(data.created),
        //   modified: new Date(data.modified)
        // };
        //const docSnap = new ProductDocumentSnapshot(this.id, snapshotData);
        return;
      }
      throw Error('failed to update product');
    } catch (err) {
      throw err;
    }
  }
  async get(include?: ProductInclude): Promise<ProductDocumentSnapshot> {
    try {
      let params: string[] = [];
      if (include && (include & ProductInclude.Prices)) {
        params.push('prices');
      }
      if (include && (include & ProductInclude.Images)) {
        params.push('images');
      }
      let query;
      if (params.length === 0) {
        query = '';
      } else {
        query = '?include=' + params.join(',');
      }

      const response = await this._ecom.get(`/products/${this.id}${query}`);

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status == 200) {
        let data = await response.json();
        const snapshotData: ProductDocumentData = {
          path: data.path,
          sku: data.sku,
          name: data.name,
          created: new Date(data.created),
          modified: new Date(data.modified)
        };

        if (data.prices) {
          snapshotData.prices = data.prices;
        }
        return new ProductDocumentSnapshot(this, snapshotData);
      }

      return new ProductDocumentSnapshot(this, undefined);
    } catch (err) {
      throw err;
    }
  }
  async delete(): Promise<void> {
    try {
      const response = await this._ecom.delete(`/products/${this.id}`);

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status == 204) {
        return;
      }
      throw Error('failed to delete product');
    } catch (err) {
      throw err;
    }
  }
}

export class ProductDocumentSnapshot extends DocumentSnapshot {}
export class ProductQueryDocumentSnapshot extends ProductDocumentSnapshot {}

export class ProductQuerySnapshot extends QuerySnapshot {
  constructor(query: Query, docs: QueryDocumentSnapshot[]) {
   super(query, docs);
  }
}
