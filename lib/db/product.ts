import EcomClient from '..';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import { ImageCollectionReference } from './image';
import { EcomError } from './error';

export interface ProductDocumentData {
  path: string;
  sku: string
  name: string
  created: Date
  modified: Date
}

interface SetProductDocumentData {

  path: string
  sku: string
  name: string
};

export class ProductCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : ProductDocumentReference {
    return new ProductDocumentReference(this._client, id, this);
  }

  async add(product: SetProductDocumentData): Promise<ProductDocumentReference> {
    let response = await this._client.post('/products', {
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
      const docRef = new ProductDocumentReference(this._client, data.id, this);
      return docRef;
    }

    throw Error('failed to add a new product');
  }

  async get(): Promise<QuerySnapshot> {
    try {
      let response = await this._client.get('/products');

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 200) {
        let data = await response.json();
        const list = data.data;

        let docs: QueryDocumentSnapshot[] = [];
        list.forEach((product: any) => {
          const docRef = new ProductDocumentReference(this._client, product.id, this);

          const productDocumentData: ProductDocumentData = {
            path: product.path,
            sku: product.sku,
            name: product.name,
            created: new Date(product.created),
            modified: new Date(product.modified)
          };

          let queryDocumentSnapshot = new ProductQueryDocumentSnapshot(docRef, productDocumentData);

          docs.push(queryDocumentSnapshot);
        });
        return new ProductQuerySnapshot(docs);
      }
      throw Error('failed to get product collection');
    } catch (err) {
      throw err;
    }
  }
}

export class ProductDocumentReference extends DocumentReference {
  private _images: ImageCollectionReference | undefined;

  constructor(client: EcomClient, id: string, parent: CollectionReference) {
    super(client, id, parent);
    this._images = undefined;
  }

  get images(): ImageCollectionReference {
    if (this._images === undefined) {
      this._images = new ImageCollectionReference(this._client, this);
    }
    return this._images;
  }

  async set(product: SetProductDocumentData): Promise<void> {
    try {
      const response = await this._client.put(`/products/${this.id}`, {
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
  async get(): Promise<ProductDocumentSnapshot> {
    try {
      const response = await this._client.get(`/products/${this.id}`);

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
        return new ProductDocumentSnapshot(this, snapshotData);
      }

      return new ProductDocumentSnapshot(this, undefined);
    } catch (err) {
      throw err;
    }
  }
  async delete(): Promise<void> {
    try {
      const response = await this._client.delete(`/products/${this.id}`);

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

export class ProductDocumentSnapshot extends DocumentSnapshot {

}

export class ProductQueryDocumentSnapshot extends ProductDocumentSnapshot {}

export class ProductQuerySnapshot extends QuerySnapshot {
  constructor(docs: QueryDocumentSnapshot[]) {
   super(docs);
  }
}
