import fs from 'node:fs/promises'
import { ObservedDate } from './types'
import { DateObserved, PriceObserved } from './impls'

export class DataSource {
  private data: Record<string, DateObserved> = {}

  async init() {
    let text: string
    try {
      text = await fs.readFile('data.json', 'utf-8')
    } catch (e: any) {
      if (e?.code == 'ENOENT') {
        return
      }
      throw e
    }
    const json = JSON.parse(text)
    if (!Array.isArray(json)) {
      return
    }
    for (const date of json) {
      this.replace(DateObserved.fromJSON(date))
    }
  }

  async save() {
    const json = Object.values(this.data).map(it => it.toJSON())
    await fs.writeFile('data.json', JSON.stringify(json, null, 2))
  }

  replace(date: ObservedDate) {
    this.data[date.date] = DateObserved.fromRaw(date)
  }

  update(date: ObservedDate) {
    const key = date.date
    if (!(key in this.data)) {
      this.replace(date)
      return
    }

    const prices = this.data[key].prices

    for (const rawPrice of date.prices) {
      const index = prices.findIndex(it => it.from == rawPrice.from)
      const price = PriceObserved.fromRaw(rawPrice)
      if (index == -1) {
        prices.push(price)
      } else if (prices[index].price > price.price) {
        prices[index] = price
      }
    }
  }

  all(): ObservedDate[] {
    const values = Object.values(this.data)
    values.sort((a, b) => a.date.localeCompare(b.date))
    return values.map(it => it.toRaw())
  }
}
