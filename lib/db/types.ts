
export enum Role {
  Shopper = 'anon',
  Customer = 'customer',
  Admin = 'admin',
  SuperUser = 'root'
}

export interface User {
  id: string
  uid: string
  priceListID: string
  role: Role
  email: string
  firstname: string
  lastname: string
  created: Date
  modified: Date
}
