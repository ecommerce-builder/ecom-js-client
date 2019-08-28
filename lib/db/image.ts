import EcomClient from '..';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
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

export interface SetImageDocumentData {
  path: string
}

export class ImageCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : ImageDocumentReference {
    return new ImageDocumentReference(this._client, id, this);
  }

  /**
   * The `.add()` method can only be called on the `.products` collection.
   *
   * @param image the new image to add
   */
  async add(image: SetImageDocumentData): Promise<ImageDocumentReference> {
    if (this.parent === null) {
      throw Error('.add cannot be called on a root collection. Use products.doc(\'<id>\').images.add() instead');
    }

    // if (this.parent !instanceof ProductDocumentReference) {
    //   throw Error('.add can only be called on a product collection')
    // }


    const productId = this.parent.id;

    if (this.parent)
    try {
      let response = await this._client.post(`/products/${productId}/images`, {
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

        const docRef = new ImageDocumentReference(this._client, data.id, this);
        const snapRef = new ImageDocumentSnapshot(docRef, snapshotData);
        console.dir(snapRef);

        return docRef;
      }
    } catch (err) {
      throw err;
    }
    console.log(image);
    return new ImageDocumentReference(this._client, '12345', this);
  }

  async get() : Promise<QuerySnapshot> {
    return new ImageQuerySnapshot([]);
  }
}

export class ImageDocumentReference extends DocumentReference {
  async get(): Promise<DocumentSnapshot> {
    if (this.parent.parent !== null) {
      throw Error('.get must be called on the root collection only');
    }

    try {
      let response = await this._client.get(`/images/${this.id}`);

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 200) {
        let data = await response.json();

        console.dir(data);

        const snapshotData: ImageDocumentData = {
          productDocumentReference: new ProductDocumentReference(this._client, data.id, this._client.db.products),
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
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);
  }
}
