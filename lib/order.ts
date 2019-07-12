import EcomClient from './index';


type orderAddress = {
  addr1: string,
  addr2: string,
  city: string,
  county: string,
  postcode: string,
  country: string
};

class Order {
  client: EcomClient;
  id: string;
  contactName: string;
  email: string;
  billingAddr: orderAddress;
  shippingAddr: orderAddress;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, id: string, contactName: string, email: string, billingAddr: orderAddress, shippingAddr: orderAddress, created: Date, modified: Date) {
    this.id = id;
    this.client = client;
    this.contactName = contactName;
    this.email = email;
    this.billingAddr = billingAddr;
    this.shippingAddr = shippingAddr;
    this.created = created;
    this.modified = modified;
  }
}

export default Order;
