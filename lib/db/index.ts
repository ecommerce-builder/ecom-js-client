type ProductDocumentData = {
  path: string;
  sku: string
  ean: string
  name: string
  created: Date
  modified: Date
}

type SetProductDocumentData = {
  path: string
  sku: string
  ean: string
  name: string
}

enum OrderByDirection {
  Desc = 'desc',
  Asc = 'asc'
}

abstract class CollectionReference {
  parent: DocumentReference | null;

  constructor(parent: DocumentReference | null) {
    this.parent = parent;
  }

  doc(id: string) {
    return new DocumentReference(id, this);
  }

  async add(product: SetProductDocumentData): Promise<DocumentReference> {
    console.dir(product);
    return new DocumentReference('12345', this);
  }

  abstract async get() : Promise<QuerySnapshot>

  orderBy(orderBy: string, orderDirection?: OrderByDirection) {
    return new Query(this, orderBy, orderDirection, 0);
  }
}

class ProductCollectionReference extends CollectionReference {
  constructor(parent: DocumentReference | null) {
    super(parent);
  }

  async get() : Promise<QuerySnapshot> {
    return new ProductQuerySnapshot([]);
  }
}

class CategoriesCollectionReference extends CollectionReference {
  constructor(parent: DocumentReference | null) {
    super(parent);
  }

  async get() : Promise<QuerySnapshot> {
    return new CategoriesQuerySnapshot([]);
  }
}

class Query {
  private parent: CollectionReference;
  orderBy: string;
  orderDirection: OrderByDirection;
  _limit: number;

  constructor(parent: CollectionReference, orderBy: string, orderDirection: OrderByDirection | undefined, limit: number) {
    this.parent = parent;
    this.orderBy = orderBy
    this.orderDirection = orderDirection || OrderByDirection.Asc;
    this._limit = limit;
  }


  async get(): Promise<QuerySnapshot> {
    return new QuerySnapshot([]);
  }

  limit(limit: number): Query {
    return new Query(this.parent, this.orderBy, this.orderDirection, limit);
  }
}

/**
 * A QuerySnapshot contains zero or more DocumentSnapshot objects representing
 * the results of a query. The documents can be accessed as an array via the
 * docs property or enumerated using the forEach method. The number of
 * documents can be determined via the empty and size properties.
 */
class QuerySnapshot {
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

class ProductQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);
  }
}

class CategoriesQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);
  }
}

/**
* A QueryDocumentSnapshot contains data read from a document in your
* Firestore database as part of a query. The document is guaranteed
* to exist and its data can be extracted with .data() or
* .get(<field>) to get a specific field.
*
* A QueryDocumentSnapshot offers the same API surface as a
* DocumentSnapshot. Since query results contain only existing
* documents, the exists property will always be true and
* data() will never return 'undefined'
*/
class QueryDocumentSnapshot {
  readonly id: string;
  exists: boolean;
  ref: DocumentReference;

  private constructor(id: string, exists: boolean, ref: DocumentReference) {
    this.id = id;
    this.exists = exists;
    this.ref = ref;
  }
}

class DocumentReference {
  id : string
  parent: CollectionReference;

  constructor(id: string, parent: CollectionReference) {
    this.id = id;
    this.parent = parent;
  }

  async get(): Promise<ProductDocSnapshot> {
    const snap = new ProductDocSnapshot(this.id, false, this);
    return snap;
  }

  async set(product: SetProductDocumentData): Promise<void> {
    console.log(product);
  }

  async delete(): Promise<void> {
  }
}

class ProductDocSnapshot {
  readonly id: string;
  exists: boolean;
  ref: DocumentReference;

  constructor(id: string, exists: boolean, ref: DocumentReference) {
    this.id = id;
    this.exists = exists;
    this.ref = ref;
  }

  data(): ProductDocumentData | undefined {
    return undefined;
  }
}

class Db {
  readonly products: ProductCollectionReference;
  readonly categories: CategoriesCollectionReference;

  constructor() {
    this.products = new ProductCollectionReference(null);
    this.categories = new CategoriesCollectionReference(null);
  }
}

export default Db;
