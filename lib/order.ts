import EcomClient from './index';

type orderAddress = {
  contactName: string,
  addr1: string,
  addr2: string,
  city: string,
  county: string,
  postcode: string,
  country: string
};

export class Order {
  client: EcomClient;
  id: string;
  status: string;
  payment: string;
  contactName: string;
  email: string;
  billingAddr: orderAddress;
  shippingAddr: orderAddress;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, id: string, status: string, payment: string, contactName: string, email: string, billingAddr: orderAddress, shippingAddr: orderAddress, created: Date, modified: Date) {
    this.id = id;
    this.status = status;
    this.payment = payment;
    this.client = client;
    this.contactName = contactName;
    this.email = email;
    this.billingAddr = billingAddr;
    this.shippingAddr = shippingAddr;
    this.created = created;
    this.modified = modified;
  }
}
