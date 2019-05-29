import EcomClient from './index';
import Product from './product';

class Catalog {
  client: EcomClient;
  root: Category | null;

  constructor(client: EcomClient) {
    this.client = client;
    this.root = null;
  }

  strDumpTree(category: Category) {
    let output = `segment: ${category.segment}\t path: ${category.path}\tname: ${category.name}\n`;
    for (let i = 0; i < category.categories.length; i++) {
      output += this.strDumpTree(category.categories[i]);
    }
    return output;
  }

  rootCategory() : Category | null {
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

  async load() {
    function walkTree(client: EcomClient, n: Category, c: Category) {
      if (n.hasOwnProperty('products') && n.products.constructor === Array) {
        n.products.forEach(function(p) {
          c.appendProduct(new Product(client, p.sku));
        });
      }

      if (n.hasOwnProperty('categories')) {
        for (let i = 0; i < n.categories.length; i++) {
          let newN = n.categories[i];
          let newC = new Category(client, newN.segment, c.path + '/' + newN.segment, newN.name);
          c.appendChild(newC);
          walkTree(client, newN, newC);
        }
      }
    }

    try {
      let res = await this.client.get(`${this.client.endpoint}/catalog`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let tree = await res.json();
        this.root = new Category(this.client, tree.segment, tree.segment, tree.name);
        walkTree(this.client, tree, this.root);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

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