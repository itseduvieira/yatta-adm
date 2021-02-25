import Model from './database.model';

export default class Customer implements Model {
  public readonly collection = 'customers';
  public isNew = true;

  public name: string;
  public phone: string;
  public product: string;
  public plan: string;
  public day: string;
  public frequency: string;
  public type: string;
  public val: string;

  constructor() {
    this.type = '1';
    this.frequency = '1';
    this.day = '7';
    this.phone = '';
  }
}