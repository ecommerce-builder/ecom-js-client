import EcomClient from './index';
import { Address } from './address';

export class Customer {
  client: EcomClient;
  id: string;
  uid: string;
  email: string;
  firstname: string;
  lastname: string;
  created: Date;
  modified: Date;

  constructor(client: EcomClient, id: string, uid: string, email: string, firstname: string, lastname: string, created: Date, modified: Date) {
    this.client = client;
    this.id = id;
    this.uid = uid;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
    this.created = created;
    this.modified = modified;
  }

  /**
   * Create an address for a customer
   * @param {string} typ
   * @param {string} contactName
   * @param {string} addr1
   * @param {string} addr2
   * @param {string} city
   * @param {string} county
   * @param {string} postcode
   * @param {string} country
   * @returns {Address}
   */
  async createAddress(typ: string, contactName: string, addr1: string, addr2: string, city: string, county: string, postcode: string, country: string) {
    try {
      let res = await this.client.post(`${this.client.endpoint}/customers/${this.id}/addresses`, {
        typ,
        contact_name: contactName,
        addr1,
        addr2,
        city,
        county,
        postcode,
        country,
      });
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 201) {
        let data = await res.json();
        return new Address(
          this.client,
          data.id,
          data.typ,
          data.contact_name,
          data.addr1,
          data.addr2,
          data.city,
          data.county,
          data.postcode,
          data.country,
          new Date(data.created),
          new Date(data.modified),
        );
      }
      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Get address by ID
   * @param {string}    id address ID
   * @return {Address}
   */
  async getAddress(id: string) : Promise<Address | null> {
    try {
      let res = await this.client.get(`${this.client.endpoint}/addresses/${id}`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let data = await res.json();
        return new Address(
          this.client,
          data.id,
          data.typ,
          data.contact_name,
          data.addr1,
          data.addr2,
          data.city,
          data.county,
          data.postcode,
          data.country,
          new Date(data.created),
          new Date(data.modified),
        );
      }
      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getAddresses() {
    try {
      let res = await this.client.get(`${this.client.endpoint}/customers/${this.id}/addresses`);
      if (res.status >= 400) {
        let data = await res.json();
        let e = Error(data.message)
        throw e;
      }

      if (res.status === 200) {
        let data = await res.json();

        return data.map((i: any) => {
          return new Address(
            this.client,
            i.id,
            i.typ,
            i.contact_name,
            i.addr1,
            i.addr2,
            i.city,
            i.county,
            i.postcode,
            i.country,
            new Date(i.created),
            new Date(i.modified)
          );
        });
      }
      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
