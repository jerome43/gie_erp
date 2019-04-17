import DateTimeFormat = Intl.DateTimeFormat;
export class Product {
  name: string;
  description: string;
  internal_number: string;
  weight:number;
  photo: string;
  comment: string;
  date: Date;
  active:string;
  sortIndex:number; // l'index sur lequel s'opère le classement des produits dans le tableau
}
