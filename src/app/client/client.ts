import DateTimeFormat = Intl.DateTimeFormat;
import {Contact} from './contact';
export class Client {
  name: string;
  address: string;
  zipcode: number;
  town: string;
  country: string;
  phone: string;
  contacts: [Contact];
  comment: string;
  date: Date;
  active:string;
}
