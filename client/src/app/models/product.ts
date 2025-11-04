export enum ProductType {
  Physical = 0,
  Digital = 1
}

export interface Product {
    productId: number
    name: string
    price: number
    description: string
    pictureUrl: string
    imageUrl?: string  // Backend returns imageUrl
    categoryName: string
    categoryId: number
    productType: ProductType
    digitalFileUrl?: string
    isInstantDelivery: boolean
    variants?: ProductVariant[]
  }
  
  export interface Category {
    categoryId: number
    name: string
  }

  export interface ProductVariant {
  productVariantId: number
  productId: number
  price: number               // Actual price to display (priceOverride if set, otherwise base price)
  priceOverride?: number | null  // Custom price for this variant (null if using base price)
  quantityInStock: number
  attributeValueIds: number[]  // IDs od izabranih vrednosti atributa
  attributes?: VariantAttribute[] // detaljnije info o atributima
}

export interface VariantAttribute {
  attributeName: string
  attributeValue: string
}
  export interface ProductParams {
    orderBy: string;
    searchTerm?: string;
    categories: string[];
    attributeValueIds?: number[];
    productTypes: string[];
    pageNumber: number;
    pageSize: number;
}
