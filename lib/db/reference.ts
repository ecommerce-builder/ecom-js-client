import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import EcomClient from '../index';

export abstract class DocumentReference {
  protected _ecom: EcomClient;
  private _id: string;
  private _parent: CollectionReference

  /**
   * @hideconstructor
   */
  constructor(ecom: EcomClient, id: string, parent: CollectionReference) {
    this._ecom = ecom;
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
  abstract delete(): Promise<void>
}

export class Query {
  /**
   * @hideconstructor
   */
  constructor(protected readonly _ecom: EcomClient) {
  }

  get ecom(): EcomClient {
    return this._ecom;
  }

  /**
   * Returns a new Query that constrains the value of a Document property.
   */
  where(field: string, opStr: string, value: unknown): Query {
    console.log(`field=${field}`);
    console.log(`opStr=${opStr}`);
    console.log(`value=${value}`);

    return new Query(this._ecom);
  }

  /**
   * Executes the query and returns the results as a
   * [QuerySnapshot]{@link QuerySnapshot}.
   *
   * @returns {Promise.<QuerySnapshot>} A Promise that resolves with the results
   * of the Query.
   */
  async get(): Promise<QuerySnapshot> {
    return new QuerySnapshot(this, []);
  }
}

/**
 * @class
 * @extends Query
 */
export abstract class CollectionReference extends Query {
  private _parent: DocumentReference | null;

  /**
   * @hideconstructor
   *
   * @param ecom The Ecom client.
   */
  constructor(ecom: EcomClient, parent: DocumentReference | null) {
    super(ecom);
    this._parent = parent;
  }

  // get client() : EcomClient {
  //   return this._ecom!;
  // }

  /**
   * A reference to the containing DocumentReference if this is a
   * subcollection. If this isn't a subcollection, the reference
   * is null.
   *
   * @readonly
   */
  get parent() : DocumentReference | null {
    return this._parent;
  }

  abstract doc(id: string): DocumentReference
  abstract async add(data: any): Promise<DocumentReference | undefined>
  abstract async get(): Promise<QuerySnapshot>
  // abstract orderBy(orderBy: string, orderDirection?: OrderByDirection): Query
}

/**
 * A QuerySnapshot contains zero or more DocumentSnapshot objects representing
 * the results of a query. The documents can be accessed as an array via the
 * docs property or enumerated using the forEach method. The number of
 * documents can be determined via the empty and size properties.
 */
export class QuerySnapshot {
  constructor(
    protected readonly _query: Query,
    private _docs: QueryDocumentSnapshot[]
  ) {}

  /**
   * @readonly
   */
  get docs(): QueryDocumentSnapshot[] {
    return this._docs;
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
