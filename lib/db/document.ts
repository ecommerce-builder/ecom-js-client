import { DocumentReference } from './reference';
import { ProductDocumentData } from './product';
import { CategoryDocumentData } from './category';
import { ProductCategoryDocumentData } from './product-category';
import { PriceListDocumentData } from './price-list';
import { UserDocumentData } from './user';

type DocSnapData =
  ProductDocumentData |
  PriceListDocumentData |
  CategoryDocumentData |
  ProductCategoryDocumentData |
  UserDocumentData;

export abstract class DocumentSnapshot {
  private _ref: DocumentReference;
  private _data: DocSnapData | undefined = undefined;

  /**
   * @hideconstructor
   */
  constructor(ref: DocumentReference, data: DocSnapData | undefined) {
    this._ref = ref;
    this._data = data;
  }

  /**
   * A [DocumentReference]{@link DocumentReference} for the document
   * @readonly
   */
  get ref(): DocumentReference {
    return this._ref;
  }

  /**
   * The ID of the document for which this DocumentSnapshot contains data
   * @readonly
   */
  get id(): string {
    return this._ref.id;
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
export class QueryDocumentSnapshot extends DocumentSnapshot {
  constructor(ref: DocumentReference, data: DocSnapData | undefined) {
    super(ref, data);
  }
}
