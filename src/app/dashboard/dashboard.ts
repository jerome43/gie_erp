import {Product} from "../product/product";

export interface ProductId extends Product { id: string; }

export class  DashboardClient {
  colProduct: {product: ProductId, display: boolean}[];
  row: {id :string, name : string, numeroDelivery: number, display: boolean, quantity:number[], price:number[]}[];
  sum: {display: boolean, quantity:number}[];
}

export class  DashboardProducer {
  colProduct: {product: Product, display: boolean}[];
  row: {id :string, name : string, display: boolean, quantity:number[]}[];
  sum: {display: boolean, quantity:number}[];
}
