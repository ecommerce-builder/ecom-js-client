import EcomClient from './index';
import { Product } from './product';
import { Category } from './category';

type ProductMap = {[key: string]: Product};
type ProductPathCategoriesMap = {[key: string]: Category[]};

export class CategoryTree {
  client: EcomClient;
  leafCategories: Category[];
  nonLeafCategories: Category[];
  productPathCategoriesMap: ProductPathCategoriesMap;
  allProducts: ProductMap;
  hasProduct: any;
  root: Category | null;
  loaded: boolean;

  constructor(client: EcomClient) {
    this.client = client;
    this.leafCategories = [];
    this.nonLeafCategories = [];
    this.productPathCategoriesMap = {};
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
    function walkTree(tree: CategoryTree, n: categoryDataResponse, c: Category) {
      if (n.hasOwnProperty('products') && n.products && n.products.constructor === Object) {
        n.products.data.forEach(function(p) {
          c.appendProduct(new Product(tree.client, p.id, p.path, p.sku, p.name, new Date(p.created), new Date(p.modified)));
        });
      }

      if (n.hasOwnProperty('categories')) {
        for (let i = 0; i < n.categories.data.length; i++) {
          let newN = n.categories.data[i];
          let newC = new Category(tree.client, newN.segment, c.path + '/' + newN.segment, newN.name);
          c.appendChild(newC);
          walkTree(tree, newN, newC);tree
        }
      }
    }

    // Walk the catalog tree and build a list of leaf and non-leaf
    // categories. These are useful for application routing.
    // For example, you might create one application view for
    // leaf categories that contain products and another for
    // non-leaf categories that do not.
    // Along the walk, build a map of product path to categories.
    // This is used to determine what category to use to generate
    // breadcrumbs whilst viewing an indivual product page.
    function buildLeafAndNonLeaf(tree: CategoryTree, c: Category) {
      if (c.isLeaf()) {
        // if (!tree.leafCategories) {
        //   tree.leafCategories = [];
        // }
        tree.leafCategories.push(c);

        // Check if this leaf category has products. If
        // we have seen this product before skip it, otherwise
        // mark it in a lookup table and add it to the internal
        // list of products.
        let products = c.products;
        for (let i = 0; i < products.length; i++) {
          let product = products[i];

          if (!tree.productPathCategoriesMap.hasOwnProperty(product.path)) {
            tree.productPathCategoriesMap[product.path] = [];
          }
          tree.productPathCategoriesMap[product.path].push(c);

          if (!tree.hasProduct.hasOwnProperty(product.sku)) {
            tree.hasProduct[product.sku] = true;
            tree.allProducts[product.path] = product;
          }
        }
      } else {
        tree.nonLeafCategories.push(c);
      }

      c.categories.forEach(i => {
        buildLeafAndNonLeaf(tree, i);
      });
    }

    try {
      if ((this.loaded) && (!forceLoad)) {
        return;
      }

      const docSnap = await this.client.db.categoryTree.get();
      if (docSnap.exists) {
        const tree = docSnap.data();
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

type categoryProductDataResponse = {
  id: string
  path: string
  sku: string
  name: string
  created: string
  modified: string
};

type categoryDataResponse = {
  segment: string
  name: string
  categories: {
    object: string
    data: categoryDataResponse[]
  },
  products?: {
    object: string
    data: categoryProductDataResponse[]
  }
};
