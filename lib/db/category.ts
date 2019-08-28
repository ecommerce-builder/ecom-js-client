import EcomClient from '../index';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { QueryDocumentSnapshot, DocumentSnapshot } from './document';

export interface CategoriesDocumentData {
  path: string
  created: Date
  modified: Date
}

interface SetCategoriesDocumentData {
  path: string
};

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
