import EcomClient from './index';
import Product from './product';

class Category {
  client: EcomClient;
  segment: string;
  path: string;
  name: string;
  parent: Category | null;
  products: Product[];
  categories: Category[];

  constructor(client: EcomClient, segment: string, path: string, name: string) {
    this.client = client;
    this.segment = segment;
    this.path = path;
    this.name = name;
    this.parent = null;
    this.products = [];
    this.categories = [];
  }

  appendProduct(product: Product) {
    this.products.push(product);
  }

  appendChild(category: Category) {
    category.parent = this;
    this.categories.push(category);
  }

  setParent(category: Category) {
    this.parent = category;
  }

  hasCategories() : boolean {
    return this.categories.length > 0;
  }

  async loadProducts(forceLoad = false) {
    if (!this.isLeaf()) {
      throw Error('cannot load products on non-leaf category');
    }

    let promises : Promise<void>[] = [];
    this.products.forEach(function(product) {
      promises.push(product.load(forceLoad));
    });
    return Promise.all(promises);
  }

  hasProductWithPath(path: string) : boolean {
    for (let p of this.products) {
      if (p.path === path) {
        return true;
      }
    }
    return false;
  }

  breadcrumbs() : BreadCrumb[] {
    let current : Category | null = this;
    let crumbs : BreadCrumb[] = [];
    let disabled = true;
    while (current !== null) {
      crumbs.unshift(new BreadCrumb(current.segment, current.name, current.path, disabled));
      current = current.parent;
      disabled = false;
    }
    return crumbs;
  }

  unloadProducts() {
    if (!this.isLeaf()) {
      throw Error('cannot load products on non-leaf category');
    }
    this.products.forEach(function(product) {
      product.unload();
    });
  }

  /**
   * Looks through the child categories to find
   * a matching segment. Runs in O(n) time.
   * @param {string} segment e.g 'shoes', 'widgets' etc
   */
  find(segment: string) : Category | null {
    if (!this.hasCategories()) {
      return null;
    }
    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].segment === segment) {
        return this.categories[i];
      }
    }
    return null;
  }

  isLeaf() : boolean {
    return this.categories.length === 0;
  }
}

class BreadCrumb {
  segment: string;
  path: string;
  name: string;
  disabled: boolean;
  constructor(segment: string, name: string, path: string, disabled: boolean) {
    this.segment = segment;
    this.name = name;
    this.path = path;
    this.disabled = disabled;
  }
}

export default Category;
