import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import EcomClient from '../index';
import { Db } from '.';

export abstract class DocumentReference {
  protected _db: Db;
  private _id: string;
  private _parent: CollectionReference

  /**
   * @hideconstructor
   */
  constructor(db: Db, id: string, parent: CollectionReference) {
    this._db = db;
    this._id = id;
    this._parent = parent;
  }

  get id(): string {
    return this._id!;
  }

  get parent(): CollectionReference {
    return this._parent;
  }

  abstract get(): Promise<DocumentSnapshot>
}

export abstract class CollectionReference {
  private _client: EcomClient;
  private _parent: DocumentReference | null;

  /**
   * @hideconstructor
   */
  constructor(client: EcomClient, parent: DocumentReference | null) {
    this._client = client;
    this._parent = parent;
  }

  get client() : EcomClient {
    return this._client!;
  }

  get parent() : DocumentReference | null {
    return this._parent;
  }

  abstract doc(id: string): DocumentReference
  abstract async add(data: any): Promise<DocumentReference | undefined>
  abstract async get(): Promise<QuerySnapshot>
  // abstract orderBy(orderBy: string, orderDirection?: OrderByDirection): Query
}

enum OrderByDirection {
  Desc = 'desc',
  Asc = 'asc'
}

export abstract class Query {
  readonly parent: CollectionReference;
  orderBy: string;
  orderDirection: OrderByDirection;
  _limit: number;

  constructor(parent: CollectionReference, orderBy: string, orderDirection: OrderByDirection | undefined, limit: number) {
    this.parent = parent;
    this.orderBy = orderBy
    this.orderDirection = orderDirection || OrderByDirection.Asc;
    this._limit = limit;
  }


  abstract async get(): Promise<QuerySnapshot>

  abstract limit(limit: number): Query
}

/**
 * A QuerySnapshot contains zero or more DocumentSnapshot objects representing
 * the results of a query. The documents can be accessed as an array via the
 * docs property or enumerated using the forEach method. The number of
 * documents can be determined via the empty and size properties.
 */
export class QuerySnapshot {
  private docs: Array<QueryDocumentSnapshot>;

  constructor(docs: Array<QueryDocumentSnapshot>) {
    this.docs = docs;
  }

  /**
  * Enumerates all of the documents in the QuerySnapshot.
  * @param {function} callback
  */
  forEach(callback: (qds: QueryDocumentSnapshot) => void) {
    if (typeof callback !== 'function') {
      throw TypeError('callback must be a function');
    }

    for (const doc of this.docs) {
      callback(doc);
    }
  }

  [Symbol.iterator]() {
    var index = -1;
    var docs  = this.docs;

    return {
      next: () => ({
        value: docs[++index],
        done: !(index in docs)
      })
    };
  };
}
