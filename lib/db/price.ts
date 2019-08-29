import EcomClient from '../index';
import { Query, CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { QueryDocumentSnapshot, DocumentSnapshot } from './document';
import { EcomError } from './error';

export interface PriceDocumentData {
}

export interface SetPriceDocumentData {
  break: number
  unit_price: number
};

export class PriceCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : PriceDocumentReference {
    return new PriceDocumentReference(this._ecom, id, this);
  }

  async add(data: SetPriceDocumentData[]): Promise<DocumentReference | undefined> {
    console.dir(data);
    return new PriceDocumentReference(this._ecom, '12345', this);
  }

  async get() : Promise<PriceQuerySnapshot> {
    return new PriceQuerySnapshot(this, []);
  }

  async set(data: SetPriceDocumentData[]): Promise<void> {
    console.dir(data);

    if (this.parent === null) {
      throw Error('.add cannot be called on the prices root collection. Use products.doc(\'<id>\').prices.add() instead');
    }

    try {
      const productId = this.parent.id;
      let response = await this._ecom.put(`/products/${productId}?price_list_id=`, {

      });

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status >= 200) {
        return;
      }

      throw Error('failed to update product prices');
    } catch (err) {
      throw err;
    }
  }
}

export class PriceDocumentReference extends DocumentReference {
  async set(data: SetPriceDocumentData): Promise<void> {
    console.dir(data);
  }

  async get(): Promise<PriceDocumentSnapshot> {
    return new PriceDocumentSnapshot(this, undefined);
  }

  async delete(): Promise<void> {
  }
}

export class PriceDocumentSnapshot extends DocumentSnapshot {

}

export class PriceQuerySnapshot extends QuerySnapshot {
  constructor(query: Query, docs: QueryDocumentSnapshot[]) {
   super(query, docs);
  }
}
