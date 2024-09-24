import axios from 'axios';
import { ProductData } from './productData';
import { parseStringPromise } from 'xml2js';
import { ProductUpdateBuilder } from '@relewise/integrations';
import { ProductUpdate } from '@relewise/client';

export class JsonProductJob {
  async execute(): Promise<string> {
    try {
      const url = 'https://cdn.relewise.com/academy/productdata/customjsonfeed';
      const response = await axios.get<ProductData[]>(url);

      const productData: ProductData[] = response.data;

      const relewiseProducts: ProductUpdate[] = productData.map((product) =>
        this.mapToRelewiseProduct(product)
      );

      return `Mapped ${relewiseProducts.length} products successfully. (JSON)`;

    } catch (error) {
      console.error('Error fetching or mapping products:', error);
      return 'Failed to fetch or map products.';
    }
  }

  private mapToRelewiseProduct(product: ProductData): ProductUpdate {
    const english = 'en';
    const usd = 'USD';

    const productBuilder = new ProductUpdateBuilder({
      id: product.productId,
      productUpdateKind: 'ReplaceProvidedProperties',
      variantUpdateKind: 'ReplaceProvidedProperties',
      replaceExistingVariants: false,
    })
      .displayName([
        {
          language: english,
          value: product.productName,
        },
      ])
      .salesPrice([{ currency: usd, amount: this.parsePrice(product.salesPrice) }])
      .listPrice([{ currency: usd, amount: this.parsePrice(product.listPrice) }]);

    return productBuilder.build();
  }

  private parsePrice(price: string): number {
    if (!price) return 0;
    const numericString = price.replace(/[^0-9.]/g, '');
    return parseFloat(numericString);
  }
}

export class GoogleShoppingProductJob {
  async execute(): Promise<string> {
    try {
      const xmlUrl = 'https://cdn.relewise.com/academy/productdata/googleshoppingfeed';
      const response = await axios.get(xmlUrl, { responseType: 'text' });

      const xmlData = response.data;
      const parsedXml = await parseStringPromise(xmlData, { explicitArray: false });

      const items = parsedXml.rss.channel.item;

      const mappedProducts: ProductUpdate[] = [];
      const english = 'en';
      const usd = 'USD';

      for (const item of items) {
        const productId = item['g:id'];
        const title = item['title'];
        const price = item['g:price'];
        const salePrice = item['g:sale_price'];

        if (productId && title) {
          const productBuilder = new ProductUpdateBuilder({
            id: productId,
            productUpdateKind: 'ReplaceProvidedProperties',
            variantUpdateKind: 'ReplaceProvidedProperties',
            replaceExistingVariants: false,
          })
            .displayName([{ language: english, value: title }])
            .listPrice([{ currency: usd, amount: this.parsePrice(price) }])
            .salesPrice([{ currency: usd, amount: this.parsePrice(salePrice) }]);

          const product = productBuilder.build();
          mappedProducts.push(product);
        }
      }

      return `Mapped ${mappedProducts.length} products successfully. (XML)`;

    } catch (error) {
      console.error('Error fetching or mapping products:', error);
      return 'Failed to fetch or map products.';
    }
  }

  private parsePrice(price: string): number {
    if (!price) return 0;
    const numericString = price.replace(/[^0-9.]/g, '');
    return parseFloat(numericString);
  }
}

export class RawProductDataJob {
  async execute(): Promise<string> {
    try {
      const rawUrl = 'https://cdn.relewise.com/academy/productdata/raw';
      const response = await axios.get(rawUrl);
      const rawData = response.data;

      const lines = rawData.split(/\r?\n/);
      const mappedProducts: ProductUpdate[] = [];
      const english = 'en';
      const usd = 'USD';

      for (let i = 2; i < lines.length; i++) {
        const columns = lines[i].split('|');
        if (columns.length < 6) continue;

        const productId = columns[1]?.trim();
        const productName = columns[2]?.trim();
        const listPrice = columns[3]?.trim();
        const salesPrice = columns[4]?.trim();

        if (productId && productName) {
          const productBuilder = new ProductUpdateBuilder({
            id: productId,
            productUpdateKind: 'ReplaceProvidedProperties',
            variantUpdateKind: 'ReplaceProvidedProperties',
            replaceExistingVariants: false,
          })
            .displayName([{ language: english, value: productName }])
            .listPrice([{ currency: usd, amount: this.parsePrice(listPrice) }])
            .salesPrice([{ currency: usd, amount: this.parsePrice(salesPrice) }]);

          const product = productBuilder.build();
          mappedProducts.push(product);
        }
      }

      return `Mapped ${mappedProducts.length} products successfully. (RAW)`;

    } catch (error) {
      console.error('Error fetching or mapping products:', error);
      return 'Failed to fetch or map products.';
    }
  }

  private parsePrice(price: string): number {
    if (!price) return 0;
    const numericString = price.replace(/[^0-9.]/g, '');
    return parseFloat(numericString);
  }
}