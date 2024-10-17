import { ObservedDate, ObservedPrice, PriceSource } from './types'

export class PriceObserved implements ObservedPrice {
  constructor(public from: PriceSource, public price: number) {
  }

  toRaw(): ObservedPrice {
    return {
      from: this.from,
      price: this.price
    }
  }

  toJSON(): any {
    return this.toRaw()
  }

  static fromRaw(raw: ObservedPrice): PriceObserved {
    return new PriceObserved(raw.from, raw.price)
  }

  static fromJSON(json: any): PriceObserved {
    if (!('from' in json) || !('price' in json)) {
      throw new Error('Invalid JSON: Missing required fields')
    }
    return new PriceObserved(json.from, json.price)
  }
}

export class DateObserved {
  constructor(public date: string, public prices: PriceObserved[]) {
  }

  toRaw(): ObservedDate {
    return {
      date: this.date,
      prices: this.prices.map(it => it.toRaw())
    }
  }

  toJSON(): any {
    return {
      date: this.date,
      prices: this.prices.map(it => it.toJSON())
    }
  }

  static fromRaw(raw: ObservedDate): DateObserved {
    return new DateObserved(raw.date, raw.prices.map(PriceObserved.fromRaw))
  }

  static fromJSON(json: any): DateObserved {
    if (!('date' in json) || !('prices' in json)) {
      throw new Error('Invalid JSON: Missing required fields')
    }
    if (!Array.isArray(json.prices)) {
      throw new Error('Invalid JSON: prices must be an array')
    }
    return new DateObserved(
      json.date,
      json.prices.map(PriceObserved.fromJSON)
    )
  }
}
