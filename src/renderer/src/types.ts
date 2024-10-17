export enum PriceSource {
  Kabum = 'Kabum',
  Pichau = 'Pichau',
  Terabyte = 'Terabyte',
}

export interface ObservedPrice {
  from: PriceSource;
  price: number;
}

export interface ObservedDate {
  date: string; // date string with format 'YYYY-MM-DD'
  prices: ObservedPrice[];
}

