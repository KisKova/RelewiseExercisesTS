import axios from 'axios';
import { ProductData } from './productData';
import { ProductUpdateBuilder } from '@relewise/integrations';
import { Product } from '@relewise/client';

// JSON Product data mapper

export class ProductJob {
  async execute(): Promise<string> {
    try {
      const url = 'https://cdn.relewise.com/academy/productdata/customjsonfeed';
      const response = await axios.get<ProductData[]>(url);

      const productData: ProductData[] = response.data;

      const relewiseProducts: Product[] = productData.map((product) =>
        this.mapToRelewiseProduct(product)
      );

      return `Mapped ${relewiseProducts.length} products successfully.`;

    } catch (error) {
      console.error('Error fetching or mapping products:', error);
      return 'Failed to fetch or map products.';
    }
  }

  private mapToRelewiseProduct(product: ProductData): Product {
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
      .salesPrice([{ currency: usd, amount: product.salesPrice }])
      .listPrice([{ currency: usd, amount: product.listPrice }]);

    return productBuilder.build() as unknown as Product;
  }
}
