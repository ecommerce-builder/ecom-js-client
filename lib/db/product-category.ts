import EcomClient from '../index';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { QueryDocumentSnapshot, DocumentSnapshot } from './document';
import { EcomError } from './error';
import { ProductDocumentReference } from './product';
import { CategoryDocumentReference } from './category';

export interface ProductCategoryDocumentData {
  productId: string
  categoryId: string
  pri: number
  created: Date
  modified: Date
}

// export interface SetProductCategoryDocumentData {
//   productId: string
//   categoryId: string
// }

export interface SetProductCategoryDocumentData {
  productDocumentReference: ProductDocumentReference
  categoryDocumentReference: CategoryDocumentReference
}

export class ProductCategoryCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string): DocumentReference {
    return new ProductCategoryDocumentReference(this._client, id, this);
  }

  async add(assoc: SetProductCategoryDocumentData): Promise<DocumentReference> {
    try {
      let response = await this._client.post('/products-categories', {
        product_id: assoc.productDocumentReference.id,
        category_id: assoc.categoryDocumentReference.id
      });

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 201) {
        let data = await response.json();

        const snapshotData: ProductCategoryDocumentData = {
          productId: data.product_id,
          categoryId: data.category_id,
          pri: data.pri,
          created: new Date(data.created),
          modified: new Date(data.modified)
        };

        const docSnap = new ProductCategoryDocumentSnapshot(data.id, snapshotData);

        console.dir(docSnap);

        const docRef = new ProductCategoryDocumentReference(this._client, data.id, this);
        return docRef;
      }
    } catch (err) {
      throw err;
    }
    return new ProductCategoryDocumentReference(this._client, '12345', this);
  }

  async get() : Promise<ProductCategoryQuerySnapshot> {
    return new ProductCategoryQuerySnapshot([]);
  }
}

export class ProductCategoryDocumentReference extends DocumentReference {
  async set(data: any): Promise<void> {
    console.dir(data);
  }

  async get(): Promise<ProductCategoryDocumentSnapshot> {
    return new ProductCategoryDocumentSnapshot(this, {
      priceListCode: 'test',
      currenyCode: 'GBP',
      strategy: 'simple',
      name: 'test',
      description: 'test',
      incTax: false,
      created: new Date(),
      modified: new Date(),
    });
  }

  async delete(): Promise<void> {
    try {
      const response = await this._client.delete(`/products-categories/${this.id}`);

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status == 204) {
        return;
      }
      throw Error('failed to delete product to category association');
    } catch (err) {
      throw err;
    }
  }
}

export class ProductCategoryDocumentSnapshot extends DocumentSnapshot {

}

export class ProductCategoryQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);

  }
}
