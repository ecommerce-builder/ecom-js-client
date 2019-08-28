import EcomClient from '../index';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { QueryDocumentSnapshot, DocumentSnapshot } from './document';
import { EcomError } from './error';

export interface PriceListDocumentData {
  priceListCode: string
  currenyCode: string
  strategy: string
  incTax: boolean
  name: string
  description: string
  created: Date
  modified: Date
}

export interface SetPriceListDocumentData {
  priceListCode: string
  currencyCode: string
  strategy: string
  incTax: boolean
  name: string
  description: string
};

export class PriceListCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : PriceListDocumentReference {
    return new PriceListDocumentReference(this._client, id, this);
  }

  async add(data: SetPriceListDocumentData): Promise<DocumentReference | undefined> {
    try {
      let response = await this._client.post('/price-lists', {
        price_list_code: data.priceListCode,
        currency_code: data.currencyCode,
        strategy: data.strategy,
        inc_tax: data.incTax,
        name: data.name,
        description: data.description
      });

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 201) {
        let data = await response.json();

        const snapshotData: PriceListDocumentData = {
          priceListCode: data.price_list_code,
          currenyCode: data.currency_code,
          strategy: data.strategy,
          incTax: data.inc_tax,
          name: data.name,
          description: data.description,
          created: new Date(data.created),
          modified: new Date(data.modified)
        }

        const snapRef = new PriceListDocumentSnapshot(data.id, snapshotData);

        console.dir(snapRef);

        const docRef = new PriceListDocumentReference(this._client, data.id, this);
        return docRef;
      }
      return undefined;
    } catch (err) {
      throw err;
    }
  }

  async get() : Promise<PriceListQuerySnapshot> {
    return new PriceListQuerySnapshot([]);
  }
}

export class PriceListDocumentReference extends DocumentReference {
  async set(data: SetPriceListDocumentData): Promise<void> {
    try {
      const response = await this._client.put(`/price-lists/${this.id}`, {
        price_list_code: data.priceListCode,
        currency_code: data.currencyCode,
        strategy: data.strategy,
        inc_tax: data.incTax,
        name: data.name,
        description: data.description
      });

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status == 200) {
        let data = await response.json();

        const snapshotData: PriceListDocumentData = {
          priceListCode: data.price_list_code,
          currenyCode: data.currency_code,
          strategy: data.strategy,
          incTax: data.inc_tax,
          name: data.name,
          description: data.description,
          created: new Date(data.created),
          modified: new Date(data.modified)
        };
        console.log(snapshotData);

      }
    } catch (err) {
      throw err;
    }
    console.log('updating price list id=${this.id} in the db');
    console.log(data);
  }

  async get(): Promise<PriceListDocumentSnapshot> {
    try {
      const response = await this._client.get(`/price-lists/${this.id}`);

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status == 200) {
        let data = await response.json();

        const snapshotData: PriceListDocumentData = {
          priceListCode: data.price_list_code,
          currenyCode: data.currency_code,
          strategy: data.strategy,
          incTax: data.inc_tax,
          name: data.name,
          description: data.description,
          created: new Date(data.created),
          modified: new Date(data.modified)
        };
        return new PriceListDocumentSnapshot(this, snapshotData);
      }

      return new PriceListDocumentSnapshot(this, undefined);
    } catch (err) {
      throw err;
    }
  }
  async delete(): Promise<void> {

  }
}

export class PriceListDocumentSnapshot extends DocumentSnapshot {

}

export class PriceListQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);

  }
}
