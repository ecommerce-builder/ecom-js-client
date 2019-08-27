import EcomClient from './index';

export class Address {
  client: EcomClient;
  id: string;
  typ: string;
  contactName: string;
  addr1: string;
  addr2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  created: Date;
  modified: Date;

  /**
   * @param {string} client reference to the EcomClient instance
   * @param {string} typ          'billing' or 'shipping'
   * @param {string} id            address ID
   * @param {string} contactName
   * @param {string} addr1
   * @param {string} addr2
   * @param {string} city
   * @param {string} county
   * @param {string} postcode
   * @param {string} country      2 digit country code
   * @param {Date}   created
   * @param {Date}   modified
   */
  constructor(client: EcomClient, id: string, typ: string, contactName: string, addr1: string, addr2: string, city: string, county: string, postcode: string, country: string, created: Date, modified: Date) {
    this.client = client;
    this.id = id;
    this.typ = typ;
    this.contactName = contactName;
    this.addr1 = addr1;
    this.addr2 = addr2;
    this.city = city;
    this.county = county;
    this.postcode = postcode;
    this.country = country;
    this.created = created;
    this.modified = modified;
  }

  async delete() {
    try {
      let res = await this.client.delete(`${this.client.endpoint}/addresses/${this.id}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }
      if (res.status === 204) {
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
