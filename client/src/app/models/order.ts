import type { DigitalDownload } from './digitalDownload';

export interface OrderItemAttribute {
  orderItemAttributeId: number;
  attributeName: string;
  attributeValue: string;
}

export interface OrderItem {
  orderItemId: number;
  productId: number;
  productVariantId?: number;
  productName: string;
  productDescription?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  productImageUrl?: string;
  attributes: OrderItemAttribute[];
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
  orderNumber: string;
  userId?: number;
  buyerEmail: string;
  orderDate: string;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderItems: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  paymentIntentId?: string;
  paymentStatus: string;
  shippingAddress: Address;
  billingAddress?: Address;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  trackingNumber?: string;
  // Legacy/optional fields for backward compatibility
  hasDigitalItems?: boolean;
  digitalDownloads?: DigitalDownload[];
  statusHistory?: OrderStatusHistory[];
}

export interface Address {
  orderAddressId?: number;
  userId?: number;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault?: boolean;
  addressType?: string;
  // Legacy fields for backward compatibility
  address1?: string;
  zip?: string;
}

export interface OrderFormData {
  shippingAddress: Address;
  paymentMethod: string;
}
