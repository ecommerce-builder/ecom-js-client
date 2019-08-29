import EcomClient from '../index';
import { Query, CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { QueryDocumentSnapshot, DocumentSnapshot } from './document';
import { EcomError } from './error';
import { ProductDocumentReference } from './product';
import { CategoryDocumentReference } from './category';

export interface ProductCategoryDocumentData {
  productId: string
  productPath: string
  productSKU: string
  productName: string
  categoryId: string
  categoryPath: string
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
    return new ProductCategoryDocumentReference(this._ecom, id, this);
  }

  async add(assoc: SetProductCategoryDocumentData): Promise<DocumentReference> {
    try {
      let response = await this._ecom.post('/products-categories', {
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
          productPath: data.product_path,
          productSKU: data.product_sku,
          productName: data.product_name,
          categoryId: data.category_id,
          categoryPath: data.category_path,
          pri: data.pri,
          created: new Date(data.created),
          modified: new Date(data.modified)
        };

        const docSnap = new ProductCategoryDocumentSnapshot(data.id, snapshotData);

        console.dir(docSnap);

        const docRef = new ProductCategoryDocumentReference(this._ecom, data.id, this);
        return docRef;
      }
    } catch (err) {
      throw err;
    }
    return new ProductCategoryDocumentReference(this._ecom, '12345', this);
  }

  async get() : Promise<ProductCategoryQuerySnapshot> {
    try {
      const response = await this._ecom.get('/products-categories');

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 200) {
        let data = await response.json();
        const list = data.data;

        let docs: QueryDocumentSnapshot[] = [];
        list.forEach((data: any) => {
          const docRef = new ProductCategoryDocumentReference(this._ecom, data.id, this);

          const documentData: ProductCategoryDocumentData = {
            productId: data.product_id,
            productPath: data.product_path,
            productSKU: data.product_sku,
            productName: data.product_name,
            categoryId: data.category_id,
            categoryPath: data.category_path,
            pri: data.pri,
            created: new Date(data.created),
            modified: new Date(data.modified)
          };

          let queryDocumentSnapshot = new ProductCategoryQueryDocumentSnapshot(docRef, documentData);

          docs.push(queryDocumentSnapshot);
        });
        return new ProductCategoryQuerySnapshot(this, docs);
      }
      throw Error('failed to get product collection');
    } catch (err) {
      throw err;
    }
    return new ProductCategoryQuerySnapshot(this, []);
  }
}

export class ProductCategoryDocumentReference extends DocumentReference {
  async set(data: any): Promise<void> {
    console.dir(data);
  }

  async get(): Promise<ProductCategoryDocumentSnapshot> {
    try {
      const response = await this._ecom.get(`/products-categories/${this.id}`);

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status == 200) {
        let data = await response.json();

        const snapshotData: ProductCategoryDocumentData = {
          productId: data.product_id,
          productPath: data.product_path,
          productSKU: data.product_sku,
          productName: data.product_name,
          categoryId: data.category_id,
          categoryPath: data.category_path,
          pri: data.pri,
          created: new Date(data.created),
          modified: new Date(data.modified)
        };

        return new ProductCategoryDocumentSnapshot(this, snapshotData);
      }

      return new ProductCategoryDocumentSnapshot(this, undefined);
    } catch (err) {
      throw err;
    }
  }

  async delete(): Promise<void> {
    try {
      const response = await this._ecom.delete(`/products-categories/${this.id}`);

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

export class ProductCategoryDocumentSnapshot extends DocumentSnapshot {}
export class ProductCategoryQueryDocumentSnapshot extends ProductCategoryDocumentSnapshot {}

export class ProductCategoryQuerySnapshot extends QuerySnapshot {
  constructor(query: Query, docs: Array<QueryDocumentSnapshot>) {
   super(query, docs);
  }
}
