import EcomClient from '..';

import firebaseConfig from './firebase-config';
import { ImageDocumentReference } from '../dist/db/image';
import { Product } from '../dist/product';
import { Db } from '../dist/db';
import { PriceQuerySnapshot } from '../dist/db/price';

const client = EcomClient.initApp({
  endpoint: process.env.ENDPOINT,
  firebaseConfig: firebaseConfig,
  debug: true
});

(async () => {
  try {
    const authUser = await client.auth.signInWithDeveloperKey(process.env.DEVKEY);

    const docRef = await client.db.products.add({
      path: 'example-product-4',
      sku: '4',
      name: 'Example Product Four'
    });

    docRef.images.add({
      path: 'http://www.example.com/images/apples.jpg'
    });


    //
    // nested
    //

    // product  images
    // 123:     [567]
    // 234:     [456]
    client.db.products.doc('123').
    client.db.products.doc('123').images.add();

    client.db.images.doc('456').get(); // OK

client.db.products.doc('123').images.doc('456').get(); // NOT OK because 456 doesn't belong to 123 it belongs to 234.

    client.db.images.where('product_id', '==', 123).get(); // client.db.images.doc('123').get();

    client.db.products.doc('123').images.where().get();

    // read
    client.db.images.doc('456');


    // root level only
    imageDocRef = client.db.images
      .where(Image.WidthField, '==', 123)
      .where('width', '>', 500)
      .limit(10)
      .orderBy('created')
      .orderDirection('desc')
      .get();

    imageDocRef.delete();

    imageDocRef.set({
      // data
    })

    client.db.images.add({
      productID: 124,
      // data
    });

    client.db.images.doc('456');


    Db.prices.doc('345345');

    prices = [
      { break: 1, unitPrice: 19.95 },
      { break: 2, unitPrice: 18.32 },
      { break: 5, unitPrice: 17.81 }
    ];

    Db.prices.set({
      priceListId: 'default',
      productId: 123,
      payload: prices
    })


    Db.images.set({
      productId: 123,
      [ {}, {}, {} ]
    })

  } catch (err) {
    console.error(err.status);
    console.error(err.code);
    console.error(err.message);

    throw err;
  }
})();


product = new Product();

Product.getImages()
