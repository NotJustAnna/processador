import { BrowserContext, chromium, devices } from 'playwright'
import { ObservedPrice, PriceSource } from './types'

export class DataGenerator {
  private links = {
    kabum: 'https://www.kabum.com.br/produto/520364/processador-amd-ryzen-7-8700g-4-2ghz-5-1ghz-max-turbo-cache-8mb-octa-core-16-threads-am5-video-integrado-100-100001236box',
    pichau: 'https://www.pichau.com.br/processador-amd-ryzen-7-8700g-8-core-16-threads-4-2ghz-5-1ghz-turbo-cache-24mb-am5-100-100001236box',
    terabyte: 'https://www.terabyteshop.com.br/produto/27327/processador-amd-ryzen-7-8700g-42ghz-51ghz-turbo-8-cores-16-threads-am5-com-cooler-amd-wraith-stealth-100-100001236box'
  };

  async get(): Promise<ObservedPrice[]> {
    // Setup
    const browser = await chromium.launch();
    const context = await browser.newContext(devices["iPad (gen 7) landscape"]);

    const settled = await Promise.allSettled([
      this.kabum(context),
      this.pichau(context),
      this.terabyte(context),
    ]);

    await context.close();
    await browser.close();

    return settled
      .filter(it => it.status == 'fulfilled')
      .map(it => it.value)
  }

  private async terabyte(context: BrowserContext): Promise<ObservedPrice> {
    const page = await context.newPage()
    await page.goto(this.links.terabyte)
    const [price] = await page.locator('#valVista').allTextContents()
    await page.close()

    return {
      from: PriceSource.Terabyte,
      price: this.parseBRL(price)
    }
  }

  private async pichau(context: BrowserContext): Promise<ObservedPrice> {
    const page = await context.newPage()
    await page.goto(this.links.pichau)

    const lines = await page.locator('main .MuiContainer-root .MuiGrid-root.MuiGrid-item')
      .nth(1)
      .allInnerTexts()
      .then(arr => arr.flatMap(it => it.split('\n')))

    const price = lines[lines.findIndex(it => it == 'à vista') + 1]
    await page.close()

    return {
      from: PriceSource.Pichau,
      price: this.parseBRL(price)
    }
  }

  private async kabum(context: BrowserContext): Promise<ObservedPrice> {
    const page = await context.newPage()
    await page.goto(this.links.kabum)
    const [price] = await page.locator('#blocoValores h4').allTextContents()
    await page.close()

    return {
      from: PriceSource.Kabum,
      price: this.parseBRL(price)
    }
  }

  private parseBRL(price: string) {
    const match = price.match(/R\$\s*([\d.]*)(?:,(\d*))?/)
    if (!match) {
      throw new Error(`Failed to parse price: ${price}`)
    }
    const [_, integer, decimal] = match
    const sanitized = integer.replace(/\./g, '') + (decimal ? `.${decimal}` : '')
    return parseFloat(sanitized)
  }
}
