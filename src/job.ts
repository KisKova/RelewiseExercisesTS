import axios from 'axios';
import { ProductData } from './productData'; // Assuming you have your local types
import { ProductUpdateBuilder } from '@relewise/integrations'; // Importing the builder from relewise integrations
import { Product } from '@relewise/client'; // Importing the Relewise Product from the client

export class ProductJob {
  async execute(): Promise<string> {
    try {
      // Step 1: Download the data from the given URL
      const url = 'https://cdn.relewise.com/academy/productdata/customjsonfeed';
      const response = await axios.get<ProductData[]>(url);

      const productData: ProductData[] = response.data;

      // Step 2: Map each JSON object to the Relewise Product using ProductUpdateBuilder
      const relewiseProducts: Product[] = productData.map((product) =>
        this.mapToRelewiseProduct(product)
      );

      // Step 3: Log the display names of all mapped products
      relewiseProducts.forEach((product) => {
        console.log('Mapped Product:', product); // Log the entire product
      });

      // Step 3: Return a message with the count of mapped products
      return `Mapped ${relewiseProducts.length} products successfully.`;

    } catch (error) {
      console.error('Error fetching or mapping products:', error);
      return 'Failed to fetch or map products.';
    }
  }

  // Map a single ProductData instance to Relewise Product using ProductUpdateBuilder
  private mapToRelewiseProduct(product: ProductData): Product {
    const english = 'en'; // Assuming language code for English
    const usd = 'USD'; // Assuming the currency is USD, but could be dynamic

    // Step 2.1: Use ProductUpdateBuilder to create the product
    const productBuilder = new ProductUpdateBuilder({
      id: product.productId, // Mapping productId to id
      productUpdateKind: 'ReplaceProvidedProperties', // Using appropriate update type
      variantUpdateKind: 'ReplaceProvidedProperties', // Same for variant update kind
      replaceExistingVariants: true, // Assuming true for now, can be adjusted
    })
      .displayName([
        {
          language: english, // Assuming the language is English for now
          value: product.productName, // Mapping productName to displayName
        },
      ])
      .salesPrice([{ currency: usd, amount: product.salesPrice }]) // Mapping salesPrice to multi-currency salesPrice
      .listPrice([{ currency: usd, amount: product.listPrice }]); // Mapping listPrice similarly

    // Step 2.2: Return the built product, ensuring it conforms to the Product interface
    return productBuilder.build() as unknown as Product;
  }
}
