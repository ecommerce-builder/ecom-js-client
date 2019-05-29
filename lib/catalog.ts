import EcomClient from './index';
import Product from './product';


class Catalog {
  client: EcomClient;
  leafCategories: Category[] | undefined;
  nonLeafCategories: Category[] | undefined;
  allProducts: Product[] | undefined;
  hasProduct: any;
  root: Category | null;

  constructor(client: EcomClient) {
    this.client = client;
    this.leafCategories = undefined;
    this.nonLeafCategories = undefined;
    this.allProducts = undefined;
    this.hasProduct = {};
    this.root = null;
  }

  strDumpTree(category: Category) {
    let output = `segment: ${category.segment}\t path: ${category.path}\tname: ${category.name}\n`;
    for (let i = 0; i < category.categories.length; i++) {
      output += this.strDumpTree(category.categories[i]);
    }
    return output;
  }

  getRootCategory() : Category | null {
    return this.root;
  }

  /**
   * Find a Category in the tree by path
   *
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

  getMidRangeCategories() : object | null {
    if (!this.nonLeafCategories) {
      return null;
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

  getBottomLevelCategories() : object | null {
    if (!this.leafCategories) {
      return null;
    }

    return this.leafCategories.map(c => {
      return { segment: c.segment, path: c.path, name: c.name };
    });
  }

  getAllProducts() : object | null {
    if (!this.allProducts) {
      return null;
    }
    return this.allProducts.map(p => {
      return { sku: p.sku, path: p.path, name: p.name };
    });
  }

  async load() {
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
        if (!catalog.leafCategories) {
          catalog.leafCategories = [];
        }
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

            if (!catalog.allProducts) {
              catalog.allProducts = [];
            }
            catalog.allProducts.push(product);
          }
        }
      } else {
        if (!catalog.nonLeafCategories) {
          catalog.nonLeafCategories = [];
        }
        catalog.nonLeafCategories.push(c);
      }

      c.categories.forEach(i => {
        buildLeafAndNonLeaf(catalog, i);
      });
    }

    try {
      let res = await this.client.get(`${this.client.endpoint}/catalog`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let tree: categoryData = await res.json();

        console.log(tree);

        this.root = new Category(this.client, tree.segment, tree.segment, tree.name);
        walkTree(this, tree, this.root);

        // remove old leaf and non-leaf categories in case this method
        // has already been called.
        this.leafCategories = undefined;
        this.nonLeafCategories = undefined;
        this.allProducts = undefined;
        buildLeafAndNonLeaf(this, this.root);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
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