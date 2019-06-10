import EcomClient from './index';
import Product from './product';

type ProductMap = {[key: string]: Product}

class Catalog {
  client: EcomClient;
  leafCategories: Category[];
  nonLeafCategories: Category[];
  allProducts: ProductMap;
  hasProduct: any;
  root: Category | null;
  loaded: boolean;

  constructor(client: EcomClient) {
    this.client = client;
    this.leafCategories = [];
    this.nonLeafCategories = [];
    this.allProducts = {};
    this.hasProduct = {};
    this.root = null;
    this.loaded = false;
  }

  getRootCategory() : Category | null {
    return this.root;
  }

  /**
   * Find a Category in the tree by path
   * e.g. a/c/f/j/n
   * @returns {Category|null} object or null if not found
   */
  findCategoryByPath(path: string) : Category | null {
    if (this.root === null) {
      return null;
    }
    // example without leading forwardslash 'a/c/f/j/n'
    let segments = path.split('/');
    if (segments[0] !== this.root.segment) {
      return null;
    }

    let context : Category | null = this.root;
    for (let i = 1; i < segments.length; i++) {
      context = context.find(segments[i])
      if (context === null) {
        return null;
      }
    }
    return context;
  }

  findProductByPath(path: string) : Product | null {
    if (path in this.allProducts) {
      return this.allProducts[path];
    }
    return null;
  }

  getMidRangeCategories() : object[] {
    if (this.nonLeafCategories.length === 0) {
      return [];
    }

    let result = this.nonLeafCategories.filter(c => {
      if ((c.path.split('/').length-1) > 0) {
        return true;
      }
      return false;
    });

    return result.map(c => {
      return { segment: c.segment, path: c.path, name: c.name };
    });
  }

  getBottomLevelCategories() : object[] {
    if (this.leafCategories.length === 0) {
      return [];
    }

    return this.leafCategories.map(c => {
      return { segment: c.segment, path: c.path, name: c.name };
    });
  }


  getAllProducts() : ProductMap {
    return this.allProducts;
  }

  async load(forceLoad = false) {
    function walkTree(catalog: Catalog, n: categoryData, c: Category) {
      if (n.hasOwnProperty('products') && n.products && n.products.constructor === Array) {
        n.products.forEach(function(p) {
          c.appendProduct(new Product(catalog.client, p.sku, p.path, p.name));
        });
      }

      if (n.hasOwnProperty('categories')) {
        for (let i = 0; i < n.categories.length; i++) {
          let newN = n.categories[i];
          let newC = new Category(catalog.client, newN.segment, c.path + '/' + newN.segment, newN.name);
          c.appendChild(newC);
          walkTree(catalog, newN, newC);
        }
      }
    }

    // Walk the catalog tree and build a list of leaf and non-leaf
    // categories. These are useful for application level routing.
    // For example, you might create one application view for
    // leaf categories that contain products and another for
    // non-leaf categories that do not.
    function buildLeafAndNonLeaf(catalog: Catalog, c: Category) {
      if (c.isLeaf()) {
        // if (!catalog.leafCategories) {
        //   catalog.leafCategories = [];
        // }
        catalog.leafCategories.push(c);

        // Check if this leaf category has products. If
        // we have seen this product before skip it, otherwise
        // mark it in a lookup table and add it to the internal
        // list of products.
        let products = c.products;
        for (let i = 0; i < products.length; i++) {
          let product = products[i];
          if (!catalog.hasProduct.hasOwnProperty(product.sku)) {
            catalog.hasProduct[product.sku] = true;
            catalog.allProducts[product.path] = product;
          }
        }
      } else {
        catalog.nonLeafCategories.push(c);
      }

      c.categories.forEach(i => {
        buildLeafAndNonLeaf(catalog, i);
      });
    }

    try {
      if ((this.loaded) && (!forceLoad)) {
        return;
      }
      let res = await this.client.get(`${this.client.endpoint}/categories`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let tree: categoryData = await res.json();
        this.root = new Category(this.client, tree.segment, tree.segment, tree.name);
        walkTree(this, tree, this.root);

        // remove old leaf and non-leaf categories in case this method
        // has already been called.
        this.leafCategories = [];
        this.nonLeafCategories = [];
        this.allProducts = {};
        buildLeafAndNonLeaf(this, this.root);
        this.loaded = true;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  unload() {
    this.leafCategories = [];
    this.nonLeafCategories = [];
    this.allProducts = {};
    this.hasProduct = {};
    this.root = null;
    this.loaded = false;
  }

  static strDumpTree(category: Category) {
    let output = `segment: ${category.segment}\t path: ${category.path}\tname: ${category.name}\n`;
    for (let i = 0; i < category.categories.length; i++) {
      output += this.strDumpTree(category.categories[i]);
    }
    return output;
  }
}

type categoryProductData = {
  sku: string,
  path: string,
  name: string,
};

type categoryData = {
  segment: string,
  name: string,
  categories: categoryData[]
  products?: categoryProductData[]
};

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
    this.products.forEach(function(product) {
      product.load(forceLoad);
    });
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

export default Catalog;
