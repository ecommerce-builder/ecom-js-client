import EcomClient from '../index';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { QueryDocumentSnapshot, DocumentSnapshot } from './document';
import { EcomError } from './error';

export interface CategoriesDocumentData {
  path: string
  created: Date
  modified: Date
}

interface SetCategoriesDocumentData {
  path: string
};

export interface SetCategoriesCollectionData {
  segment: string
  name: string
  categories: SetCategoriesCollectionData[]
}

export class CategoriesCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string): CategoriesDocumentReference {
    return new CategoriesDocumentReference(this.client.db, id, this);
  }

  async add(product: any): Promise<CategoriesDocumentReference> {
    console.log(product);
    return new CategoriesDocumentReference(this.client.db, '12345', this);
  }

  async get(): Promise<QuerySnapshot> {
    return new CategoriesQuerySnapshot([]);
  }

  async set(data: SetCategoriesCollectionData): Promise<void> {
    try {
      const response = await this.client.put('/categories', data);

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
  // async link(): Promise<ProductsCategoriesDocumentReference> {

  // }
}

export class CategoriesDocumentReference extends DocumentReference {
  async set(category: SetCategoriesDocumentData): Promise<void> {
    console.log('writing category');
    console.log(category);
  }
  async get(): Promise<CategoriesDocumentSnapshot> {
    const exampleData: CategoriesDocumentData = {
      path: 'example-cat-path',
      created: new Date(),
      modified: new Date()
    }
    return new CategoriesDocumentSnapshot(this, exampleData);
  }
  async delete(): Promise<void> {}
}

class CategoriesDocumentSnapshot extends DocumentSnapshot {
}

class CategoriesQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);
  }
}
