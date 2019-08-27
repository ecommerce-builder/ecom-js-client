import EcomClient from '..';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import { ImageCollectionReference } from './image';
import { EcomError } from './error';
import { Db } from '.';

type ProductDocumentData = {
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
    return new ProductDocumentReference(this.client.db, id, this);
  }

  async add(product: any): Promise<ProductDocumentReference> {
    console.log(product);
    return new ProductDocumentReference(this.client.db, '12345', this);
  }

  async get() : Promise<QuerySnapshot> {
    return new ProductQuerySnapshot([]);
  }
}

export class ProductDocumentReference extends DocumentReference {
  private _images: ImageCollectionReference | undefined;

  constructor(db: Db, id: string, parent: CollectionReference) {
    super(db, id, parent);
    this._images = undefined;
  }

  get images(): ImageCollectionReference {
    if (this._images === undefined) {
      this._images = new ImageCollectionReference(this._db._client, this);
    }
    return this._images;
  }

  async set(product: SetProductDocumentData): Promise<void> {
    console.log(product);
  }
  async get(): Promise<ProductDocumentSnapshot> {
    try {
      const response = await this._db._client.get(`/products/${this.id}`);

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
        return new ProductDocumentSnapshot(this.id, snapshotData);
      }

      return new ProductDocumentSnapshot(this.id, undefined);
    } catch (err) {
      throw err;
    }
  }
  async delete(): Promise<void> {}
}


export class ProductDocumentSnapshot extends DocumentSnapshot {

}

export class ProductQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);
  }
}

// class ProductDocumentSnapshot {
//   readonly id: string;
//   exists: boolean;
//   ref: DocumentReference;

//   constructor(id: string, exists: boolean, ref: DocumentReference) {
//     this.id = id;
//     this.exists = exists;
//     this.ref = ref;
//   }

//   data(): ProductDocumentData | undefined {
//     return undefined;
//   }
// }
