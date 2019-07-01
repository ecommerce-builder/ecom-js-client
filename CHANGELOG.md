# CHANGELOG
## 10.0.0 (Mon 1 Jul 2019)
+ Uses `id` in place of `uuid` for all lib calls.
+ Fix bug causing No cart error.
+ Unit testing to use integer for pricing not float point representation.
+ Customer ID is held in `claims.cid` not `claims.uuid` now.
+ Update npm deps.

## 9.0.1 (wed 19 Jun 2019)
+ Fix broken `uuid` route param in `getCustomer`.

## 9.0.0 (Wed 19 Jun 2019)
+ ` getCustomer(user)` method on the ecom client replaces `makeCustomer`.

## 8.0.0 (Wed 19 Jun 2019)
+ Pass `firebase.User` object to `makeCustomer` method.

## 7.1.1 (Wed 19 Jun 2019)
+ Store the `Customer` onboard the client.

## 7.1.0 (Tue 18 Jun 2019)
+ `twoSubCategories` method added to Category class.
+ Uses `rollup-typescript2` plugin/
+ Produces `.d.ts` files in the build.
+ Puts output in the `dist` directory instead of `tscbuild`.
+ Contains broken tests.

## 7.0.0 (Tue 18 Jun 2019)
+ Improved cart API.
+ indexedDB used to store sesssion and current cart UUID.
+ Initialization process uses single `.init(opts)` method.

## 6.3.0 (Wed 12 Jun 2019)
+ Separate `Category` class into its own file.
+ Moved `Category` class into its own file.
+ Category class has new `categories()` method then returns a list of categories in which this product resides.
+ New property `productPathCategoriesMap` mapping product paths to a list of categories in which they reside.
+ Breadcrumb support methods.

## 6.2.0 (Tue 11 Jun 2019)
+ `catalog.load` uses Promise.all to load products in parallel.
+ `EcomClient.setDebugMode` method added. Console logs extra info if debug mode is enabled.
+ Add missing newlines causing git warnings.

## 6.1.0 (Mon 10 Jun 2019)
+ `catalog.findProductByPath` method.
+ pricing data added to products on load.

## 6.0.0 (Fri 7 Jun 2019)
+ `getAllProducts` returns a `ProductMap` that is `string->Product` object type.

## 5.0.0 (Mon 3 Jun 2019)
+ `rootCategory()` deprecated for `getRootCategory()`
+ uses `/categories` for retrieving the catalog. API version v0.41.0

## 4.2.0 (Wed 29 May 2019)
+ getAllProducts, getMidRangeCategories and getBottomLevelCategories always returns an Array
+ `catalog.loaded` boolean to indicate if catalog has been loaded.
+ `catalog.load(true)` to force a reload.
+ `catalog.unload()`for testing.
+ removed spurious console.log statement.

## 4.1.0 (Wed 29 May 2019)
+ Requires Ecom API version v0.39.0 and above.
+ Adds features to retrieve leaf, non-leaf categories as flat lists.
+ Adds feature to retrieve list of all products as sku, path, name tuples.

## 4.0.1 (Wed 29 May 2019)
+ Provides sourcemaps for CJS and ESM builds.

## 4.0.0 (Wed 29 May 2019)
+ Complete conversion to Typescript.
+ Fixed unit tests expect lower case uuid for customer addresses.
+ Rollup config uses Typescript. (Babel removed).
+ Unit tests require the built distribution version for testing.

## 3.2.0 (Tue 28 May 2019)
+ Load and unload products.

## 3.1.0 (Tue 28 May 2019)
+ Refactor HTTP request code to use do, get, put, post etc.
+ Use composition to pass around client instance.

## 3.0.4 (Tue, 28 May 2019)
+ Confirmed working against API v0.37.0
+ Update deps and .babelrc to use core-js@3

## 3.0.3 (Fri, 24 May 2019)
+ Fix broken package.json causing empty npm published package.
+ Alter Cart class property cartUuid -> uuid.

## 3.0.0 (Mon, 20 May 2019)
+ Use uuid instead of `cart_`, `addr_` or `customer_` prefixes

## 2.1.0 (Thu, 9 May 2019)
+ v0.27.0 API returns products property for leaf nodes of the catalog tree.
+ Defines a new Product class that takes a single param sku in its constructor.
+ Catagory tree attaches Product instances to an Array attached to leaf nodes.

## 2.0.0 (Wed, 8 May 2019)
+ Catalog API returns hierarchical JSON with categories.
+ Removes nested set model for tree building.
+ Updated unit tests.
+ Updated npm dependencies to avoid npm audit warnings.

## 1.8.1 (1 Mar 2019)
+ Fix findCategoryByPath function assumes no leading forwardslash on path names.

## 1.8.0 (1 Feb 2019)
+ Catalog management. Handling of hierarchical data.

## 1.7.1 (22 Jan 2019)
+ Remove use strict from library as its added automatically by rollup

## 1.7.0 (22 Jan 2019)
+ No longer transpiles CJS and ESM libraries. Only for UMD build.
+ Remove unnecessary test.js from from lib dir

## 1.6.0 (21 Jan 2019)
+ Fix broken unit test
+ Update outdated packages

## 1.5.0 (3 Dec 2018)
+ .babelrc uses builtin usage to avoid regeneratorRuntime errors
+ fetch dep injection removed in favour of global.fetch added by node tests

## 1.4.0 (3 Dec 2018)
+ Tests uses anon signin as API now expects a JWT for all users

## 1.3.0 (28 Nov 2018)
+ Main library uses dependency injection to push in fetch function
+ Test uses environment variables for host, email and endpoint URL
+ Babel compiler settings to use runtime generators
+ Rollup config produces UMD builds for browser
+ Works against ecom-api-go 0.6.1

## 1.2.0 (19 Nov 2018)
+ Integration tests compatible with ecom-api-go 0.5.0
+ JSON Web Token is passed in the HTTP Authorization header for all requests including cart
+ Cart API expects a minimum of at least the Annoymous sign-in
+ Tests sign-in using Firebase JS Client library

## 1.1.0 (7 Nov 2018)
+ JavaScript Client SDK intial version (compatible with Ecom API 0.3.0)
+ Tests that work with ecom API 0.3.0
