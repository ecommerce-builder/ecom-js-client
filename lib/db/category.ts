import EcomClient from '../index';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { DocumentSnapshot } from './document';
import { EcomError } from './error';

export interface CategoryDocumentData {
  path: string
  created: Date
  modified: Date
}

interface SetCategoryDocumentData {
  path: string
};

export interface SetCategoryCollectionData {
  segment: string
  name: string
  categories: SetCategoryCollectionData[]
}

export class CategoryCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string): CategoryDocumentReference {
    return new CategoryDocumentReference(this._ecom, id, this);
  }

  async add(product: any): Promise<CategoryDocumentReference> {
    console.log(product);
    return new CategoryDocumentReference(this._ecom, '12345', this);
  }

  async get(): Promise<QuerySnapshot> {
    return new QuerySnapshot(this, []);
  }

  async set(data: SetCategoryCollectionData): Promise<void> {
    try {
      const response = await this._ecom.put('/categories', data);

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 204) {
        return;
      }
      throw Error('failed to update all categories');
    } catch (err) {
      throw err;
    }
  }
  // async link(): Promise<ProductsCategoryDocumentReference> {

  // }
}

export class CategoryDocumentReference extends DocumentReference {
  async set(category: SetCategoryDocumentData): Promise<void> {
    console.log('writing category');
    console.log(category);
  }
  async get(): Promise<CategoryDocumentSnapshot> {
    const exampleData: CategoryDocumentData = {
      path: 'example-cat-path',
      created: new Date(),
      modified: new Date()
    }
    return new CategoryDocumentSnapshot(this, exampleData);
  }
  async delete(): Promise<void> {}
}

class CategoryDocumentSnapshot extends DocumentSnapshot {
}

// class CategoryQuerySnapshot extends QuerySnapshot {
//   constructor(docs: Array<QueryDocumentSnapshot>) {
//    super(docs);
//   }
// }
