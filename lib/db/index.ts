import EcomClient from '../index';
import { ProductCollectionReference } from './product';
import { CategoryCollectionReference } from './category';
import { ProductCategoryCollectionReference } from './product-category';
import { PriceListCollectionReference } from './price-list';
import { UserCollectionReference } from './user';
import { ImageCollectionReference } from './image';

interface collections {
  user: UserCollectionReference | undefined
  product: ProductCollectionReference | undefined
  image: ImageCollectionReference | undefined
  category: CategoryCollectionReference | undefined;
  productCategory: ProductCategoryCollectionReference | undefined;
  priceList: PriceListCollectionReference| undefined;
}

export class Db {
  _ecom: EcomClient;
  private _rootCollections: collections;

  constructor(ecom: EcomClient) {
    this._ecom = ecom;
    this._rootCollections = {
        user: undefined,
        product: undefined,
        image: undefined,
        category: undefined,
        productCategory: undefined,
        priceList: undefined
    }
  }

  get users(): UserCollectionReference {
    if (!this._rootCollections.user) {
      this._rootCollections.user = new UserCollectionReference(this._ecom, null);
    }
    return this._rootCollections.user;
  }

  get products(): ProductCollectionReference {
    if (!this._rootCollections.product) {
      this._rootCollections.product = new ProductCollectionReference(this._ecom, null);
    }
    return this._rootCollections.product;
  }

  get images(): ImageCollectionReference {
    if (!this._rootCollections.image) {
      this._rootCollections.image = new ImageCollectionReference(this._ecom, null);
    }
    return this._rootCollections.image;
  }

  get categories(): CategoryCollectionReference {
    if (!this._rootCollections.category) {
      this._rootCollections.category = new CategoryCollectionReference(this._ecom, null);
    }
    return this._rootCollections.category;
  }

  get productCategory(): ProductCategoryCollectionReference {
    if (!this._rootCollections.productCategory) {
      this._rootCollections.productCategory = new ProductCategoryCollectionReference(this._ecom, null);
    }
    return this._rootCollections.productCategory;
  }

  get priceLists(): PriceListCollectionReference {
    if (!this._rootCollections.priceList) {
      this._rootCollections.priceList = new PriceListCollectionReference(this._ecom, null);
    }
    return this._rootCollections.priceList;
  }
}
