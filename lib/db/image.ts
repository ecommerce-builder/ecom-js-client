import EcomClient from '..';
import { Query, CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import { EcomError } from './error';
import { ProductDocumentReference } from './product';

type ImageDocumentData = {
  productDocumentReference: DocumentReference | null;

  path: string
  gsurl: string
  width: number
  height: number
  size: number
  created: Date
  modified: Date
}

export interface AddImageDocumentData {
  productId: string
  path: string
}


export interface SetImageDocumentData {
  path: string
}

export class ImageCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : ImageDocumentReference {
    return new ImageDocumentReference(this._ecom, id, this);
  }

  /**
   * @param image the new image to add
   */
  async add(image: AddImageDocumentData): Promise<ImageDocumentReference> {
   try {
     const productId = image.productId;

      let response = await this._ecom.post(`/products/${productId}/images`, {
        path: image.path
      });

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 201) {
        let data = await response.json();
        console.log('response from server');
        console.dir(data);

        const snapshotData: ImageDocumentData = {
          productDocumentReference: this.parent,
          path: data.path,
          gsurl: data.gsurl,
          width: data.width,
          height: data.height,
          size: data.size,
          created: new Date(data.created),
          modified: new Date(data.modified)
        }

        const docRef = new ImageDocumentReference(this._ecom, data.id, this);
        const snapRef = new ImageDocumentSnapshot(docRef, snapshotData);
        console.dir(snapRef);

        return docRef;
      }
    } catch (err) {
      throw err;
    }
    console.log(image);
    return new ImageDocumentReference(this._ecom, '12345', this);
  }

  async get() : Promise<QuerySnapshot> {
    return new ImageQuerySnapshot(this, []);
  }
}

export class ImageDocumentReference extends DocumentReference {
  async get(): Promise<DocumentSnapshot> {
    if (this.parent.parent !== null) {
      throw Error('.get must be called on the root collection only');
    }

    try {
      let response = await this._ecom.get(`/images/${this.id}`);

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 200) {
        let data = await response.json();

        console.dir(data);

        const snapshotData: ImageDocumentData = {
          productDocumentReference: new ProductDocumentReference(this._ecom, data.id, this._ecom.db.products),
          path: data.path,
          gsurl: data.gsurl,
          width: data.width,
          height: data.height,
          size: data.size,
          created: new Date(data.created),
          modified: new Date(data.modified)
        };
        return new ImageDocumentSnapshot(this, snapshotData);
      }

      return new ImageDocumentSnapshot(this, undefined);
    } catch (err) {
      throw err;
    }
  }

  async delete(): Promise<void> {}
}

export class ImageDocumentSnapshot extends DocumentSnapshot {

}

export class ImageQuerySnapshot extends QuerySnapshot {
  constructor(query: Query, docs: Array<QueryDocumentSnapshot>) {
   super(query, docs);
  }
}
