import { z } from 'zod';

// Step 1: Shipping Address Schema
export const shippingAddressSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    address1: z.string().min(1, 'Address line 1 is required'),
    address2: z.string().optional(),
    address3: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    zip: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phoneNumber: z.string().optional(),
    saveAddress: z.boolean().optional()
});

// Step 2: Review Order Schema (includes address fields with optional validation)
export const reviewOrderSchema = shippingAddressSchema.partial();

// Step 3: Payment Details Schema (includes all previous fields)
export const paymentDetailsSchema = shippingAddressSchema.partial().extend({
    nameOnCard: z.string().min(1, 'Name on card is required')
});

// Combined schema array for different steps
export const validationSchemas = [
    shippingAddressSchema,
    reviewOrderSchema,
    paymentDetailsSchema
];

// Type definitions
export type ShippingAddressData = z.infer<typeof shippingAddressSchema>;
export type PaymentDetailsData = z.infer<typeof paymentDetailsSchema>;
export type CheckoutFormData = ShippingAddressData & PaymentDetailsData;