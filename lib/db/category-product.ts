import EcomClient from '../index';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { QueryDocumentSnapshot, DocumentSnapshot } from './document';

export class CategoryCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string): DocumentReference {
    return new CategoryDocumentReference(this._client, id, this);
  }

  async add(product: any): Promise<DocumentReference> {
    console.log(product);
    return new CategoryDocumentReference(this._client, '12345', this);
  }

  async get() : Promise<CategoryQuerySnapshot> {
    return new CategoryQuerySnapshot([]);
  }
}

export class CategoryDocumentReference extends DocumentReference {
  async set(data: any): Promise<void> {
    console.dir(data);
  }

  async get(): Promise<CategoryDocumentSnapshot> {
    return new CategoryDocumentSnapshot(this, {
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
}

export class CategoryDocumentSnapshot extends DocumentSnapshot {

}



export class CategoryQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);

  }
}
