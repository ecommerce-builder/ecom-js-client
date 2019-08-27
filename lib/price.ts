export class Price {
  unitPrice: number;
  created: Date;
  modified: Date;

  constructor(unitPrice: number, created: Date, modified: Date) {
      this.unitPrice = unitPrice;
      this.created = created;
      this.modified = modified;
  }
}
