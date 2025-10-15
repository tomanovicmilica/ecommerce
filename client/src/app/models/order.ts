import type { DigitalDownload } from './digitalDownload';

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  productVariantId?: number;
  attributes?: { attributeName: string; attributeValue: string }[];
  attributeValueIds?: number[];
  productType: number;
  digitalFileUrl?: string;
  isInstantDelivery?: boolean;
  imageUrl?: string;
}

export interface OrderStatusHistory {
  id: number;
  status: string;
  timestamp: string;
  notes?: string;
  trackingNumber?: string;
  updatedBy: string;
}

export interface Order {
  orderId: number;
  orderDate: string;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  shippingAddress: Address;
  paymentMethod?: string;
  hasDigitalItems?: boolean;
  digitalDownloads?: DigitalDownload[];
  trackingNumber?: string;
  statusHistory?: OrderStatusHistory[];
}

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderFormData {
  shippingAddress: Address;
  paymentMethod: string;
}
