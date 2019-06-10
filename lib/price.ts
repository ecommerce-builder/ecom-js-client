// "default": {
//   "unit_price": 57.5,
//   "created": "2019-06-07T10:11:42.154202Z",
//   "modified": "2019-06-07T10:11:42.154202Z"
// }

class Price {
  unitPrice: number;
  created: Date;
  modified: Date;

  constructor(unitPrice: number, created: Date, modified: Date) {
      this.unitPrice = unitPrice;
      this.created = created;
      this.modified = modified;
  }
}

export default Price;