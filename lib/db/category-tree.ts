import { DocumentReference } from './reference';
import { DocumentSnapshot } from './document';
import { EcomError } from './error';

export interface CategoryTreeDocumentData {
  object: string
  id: string
  segment: string
  name: string
  categories: {
    object: string
    data: CategoryTreeDocumentData[]
  }
}

interface SetCategoryTreeDocumentData {
  segment: string
  name: string
  categories: SetCategoryTreeCollectionData[]
};

export interface SetCategoryTreeCollectionData {
  segment: string
  name: string
  categories: SetCategoryTreeCollectionData[]
}

export class CategoryTreeDocumentReference extends DocumentReference {
  async set(category: SetCategoryTreeDocumentData): Promise<void> {
    console.log('writing category');
    console.log(category);
  }
  async get(): Promise<CategoryTreeDocumentSnapshot> {
    try {
      let response = await this._ecom.get('/categories-tree');

      if (response.status >= 400) {
        let data = await response.json();
        throw new EcomError(data.status, data.code, data.message);
      }

      if (response.status === 200) {
        const data = await response.json();
        return new CategoryTreeDocumentSnapshot(this, data);
      }

      return new CategoryTreeDocumentSnapshot(this, undefined);
    } catch (err) {
      throw err;
    }

  }
  async delete(): Promise<void> {}
}

class CategoryTreeDocumentSnapshot extends DocumentSnapshot {
}
