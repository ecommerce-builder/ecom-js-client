import EcomClient from '../index';
import { ProductCollectionReference } from './product';
import { CategoriesCollectionReference } from './category';
import { PriceListCollectionReference } from './price-list';
import { UserCollectionReference } from './user';

interface collections {
  user: UserCollectionReference | undefined
  product: ProductCollectionReference | undefined
  category: CategoriesCollectionReference | undefined;
  priceList: PriceListCollectionReference| undefined;
}

export class Db {
  _client: EcomClient;
  private _rootCollections: collections;

  constructor(client: EcomClient) {
    this._client = client;
    this._rootCollections = {
        user: undefined,
        product: undefined,
        category: undefined,
        priceList: undefined
    }
  }

  get users(): UserCollectionReference {
    if (!this._rootCollections.user) {
      this._rootCollections.user = new UserCollectionReference(this._client, null);
    }
    return this._rootCollections.user;
  }

  get products(): ProductCollectionReference {
    if (!this._rootCollections.product) {
      this._rootCollections.product = new ProductCollectionReference(this._client, null);
    }
    return this._rootCollections.product;
  }

  get categories(): CategoriesCollectionReference {
    if (!this._rootCollections.category) {
      this._rootCollections.category = new CategoriesCollectionReference(this._client, null);
    }
    return this._rootCollections.category;
  }

  get priceLists(): PriceListCollectionReference {
    if (!this._rootCollections.priceList) {
      this._rootCollections.priceList = new PriceListCollectionReference(this._client, null);
    }
    return this._rootCollections.priceList;
  }
}
