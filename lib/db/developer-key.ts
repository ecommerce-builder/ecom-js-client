import EcomClient from '../index';
import { Query, CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { QueryDocumentSnapshot, DocumentSnapshot } from './document';
import { EcomError } from './error';

export interface DeveloperKeyDocumentData {
  userId: string
  key: string
}

export class DeveloperKeyCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : DeveloperKeyDocumentReference {
    return new DeveloperKeyDocumentReference(this._ecom, id, this);
  }

  async add(): Promise<DocumentReference | undefined> {
    try {
      let response = await this._ecom.post('/developer-keys', {});

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 201) {
        let data = await response.json();

        const snapshotData: DeveloperKeyDocumentData = {
          userId: data.user_id,
          key: data.key
        };

        const snapRef = new DeveloperKeyDocumentSnapshot(data.id, snapshotData);

        console.dir(snapRef);

        const docRef = new DeveloperKeyDocumentReference(this._ecom, data.id, this);
        return docRef;
      }
      return undefined;
    } catch (err) {
      throw err;
    }
  }

  async get() : Promise<DeveloperKeyQuerySnapshot> {
    return new DeveloperKeyQuerySnapshot(this, []);
  }
}

export class DeveloperKeyDocumentReference extends DocumentReference {
  async set(): Promise<void> {}

  async get(): Promise<DeveloperKeyDocumentSnapshot> {
    return new DeveloperKeyDocumentSnapshot(this, undefined);
  }
  async delete(): Promise<void> {}
}

export class DeveloperKeyDocumentSnapshot extends DocumentSnapshot {}

export class DeveloperKeyQuerySnapshot extends QuerySnapshot {
  constructor(query: Query, docs: QueryDocumentSnapshot[]) {
   super(query, docs);

  }
}
