import { useState, useCallback } from 'react';
import type { Address, OrderFormData } from '../models/order';

// Order interfaces that you might need later

export function useOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = useCallback(async (orderData: OrderFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // This would call your order API endpoint
      // const response = await agent.Orders.create(orderData);
      // return response;
      console.log('Order submitted:', orderData);
      // Placeholder for actual implementation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const calculateOrderTotal = useCallback((subtotal: number, deliveryFee: number = 0) => {
    return subtotal + deliveryFee;
  }, []);

  const validateAddress = useCallback((address: Address): string[] => {
    const errors: string[] = [];

    if (!address.firstName.trim()) errors.push('First name is required');
    if (!address.lastName.trim()) errors.push('Last name is required');
    if (!address.address1.trim()) errors.push('Address is required');
    if (!address.city.trim()) errors.push('City is required');
    if (!address.state.trim()) errors.push('State is required');
    if (!address.zip.trim()) errors.push('ZIP code is required');
    if (!address.country.trim()) errors.push('Country is required');

    return errors;
  }, []);

  return {
    isSubmitting,
    error,
    submitOrder,
    calculateOrderTotal,
    validateAddress
  };
}