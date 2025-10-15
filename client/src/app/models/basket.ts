export interface Basket {
    basketId: number;
    buyerId: string;
    items: Item[];
    subtotalPrice: number
    paymentIntentId?: string;
    clientSecret?: string;
  }
  
  export interface Item {
    productId: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    quantity: number;
    productVariantId?: number;
    attributes?: { attributeName: string; attributeValue: string }[];
    attributeValueIds?: number[];
  }