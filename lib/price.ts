export class Price {
  id: string;
  productId: string;
  productPath: string;
  productSKU: string;
  priceListId: string;
  priceListCode: string;
  break: number;
  readonly unitPrice: number;
  created: Date;
  modified: Date;

  constructor(id: string, productId: string, productPath: string, productSKU: string, priceListId: string, priceListCode: string, brk: number, unitPrice: number, created: Date, modified: Date) {
    this.id = id;
    this.productId = productId;
    this.productPath = productPath;
    this.productSKU = productSKU;
    this.priceListId = priceListId;
    this.priceListCode = priceListCode;
    this.break = brk;
    this.unitPrice = unitPrice;
    this.created = created;
    this.modified = modified;
  }
}
