import EcomClient from '..';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import { Role } from './types';

export interface UserDocumentData {
  uid: string
  priceListID: string
  role: Role,
  email: string,
  firstname: string,
  lastname: string,
  created: Date
  modified: Date
}

interface NewUser {
  email: string
  password: string
  firstname: string
  lastname: string
}


export class UserCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : UserDocumentReference {
    return new UserDocumentReference(this.client.db, id, this);
  }

  async add(user: NewUser): Promise<UserDocumentReference> {
    console.log(user);
    return new UserDocumentReference(this.client.db, '12345', this);
  }

  async get() : Promise<QuerySnapshot> {
    return new UserQuerySnapshot([]);
  }
}

export class UserDocumentReference extends DocumentReference {
  async set(user: NewUser): Promise<void> {
    console.log(user);
  }

  async get(): Promise<UserDocumentSnapshot> {
    const exampleData: UserDocumentData = {
      uid: 'some-uid',
      priceListID: 'some-uuid',
      role: Role.Customer,
      email: 'user@example.com',
      firstname: 'John',
      lastname: 'Doe',
      created: new Date(),
      modified: new Date()
    };
    return new UserDocumentSnapshot(this, exampleData);
  }

  async delete(): Promise<void> {}
}


export class UserDocumentSnapshot extends DocumentSnapshot {

}

export class UserQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);
  }
}
