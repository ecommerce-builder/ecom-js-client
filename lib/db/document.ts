import { DocumentReference } from './reference';
import { CategoriesDocumentData } from './category';
import { PriceListDocumentData } from './price-list';
import { UserDocumentData } from './user';

type DocSnapData = PriceListDocumentData | CategoriesDocumentData | UserDocumentData;

export abstract class DocumentSnapshot {
  readonly id: string;
  private _data: DocSnapData | undefined = undefined;

  constructor(id: string, data: DocSnapData | undefined) {
    this.id = id;
    this._data = data;
  }

  get exists() : boolean {
    return this._data !== undefined;
  }

  data(): any | undefined {
    return this._data;
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
export class QueryDocumentSnapshot {
  readonly id: string;
  exists: boolean;
  ref: DocumentReference;

  private constructor(id: string, exists: boolean, ref: DocumentReference) {
    this.id = id;
    this.exists = exists;
    this.ref = ref;
  }
}
