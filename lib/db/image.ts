import EcomClient from '..';
import { CollectionReference, DocumentReference, QuerySnapshot } from './reference';
import { DocumentSnapshot, QueryDocumentSnapshot } from './document';
import { EcomError } from './error';

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

type CreateImageDocumentRequestBody = {
  path: string
}

export class ImageCollectionReference extends CollectionReference {
  constructor(client: EcomClient, parent: DocumentReference | null) {
    super(client, parent);
  }

  doc(id: string) : ImageDocumentReference {
    return new ImageDocumentReference(this.client.db, id, this);
  }

  /**
   * The `.add()` method can only be called on the `.products` collection.
   *
   * @param image the new image to add
   */
  async add(image: CreateImageDocumentRequestBody): Promise<ImageDocumentReference> {
    if (this.parent === null) {
      throw Error('.add cannot be called on a root collection. Use products.doc(\'<id>\').images sub-collection');
    }

    // if (this.parent !instanceof ProductDocumentReference) {
    //   throw Error('.add can only be called on a product collection')
    // }


    const productId = this.parent.id;

    if (this.parent)
    try {
      let response = await this.client.post(`/product/${productId}/images`, image);

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
          width: data.w,
          height: data.height,
          size: data.size,
          created: new Date(data.created),
          modified: new Date(data.modified)
        }
        const snapRef = new ImageDocumentSnapshot(data.id, snapshotData);

        console.dir(snapRef);

        const docRef = new ImageDocumentReference(this.client.db, data.id, this);
        return docRef;
      }
    } catch (err) {
      throw err;
    }
    console.log(image);
    return new ImageDocumentReference(this.client.db, '12345', this);
  }

  async get() : Promise<QuerySnapshot> {
    return new ImageQuerySnapshot([]);
  }
}

export class ImageDocumentReference extends DocumentReference {
  async get(): Promise<ImageDocumentSnapshot> {
    const exampleData: ImageDocumentData = {
      productDocumentReference: this.parent.parent,
      path: 'test.jpg',
      gsurl: 'gs://test.jpg',
      width: 0,
      height: 0,
      size: 0,
      created: new Date(),
      modified: new Date()
    };
    return new ImageDocumentSnapshot(this, exampleData);
  }
}

export class ImageDocumentSnapshot extends DocumentSnapshot {

}

export class ImageQuerySnapshot extends QuerySnapshot {
  constructor(docs: Array<QueryDocumentSnapshot>) {
   super(docs);
  }
}
