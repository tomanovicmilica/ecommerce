import { useMemo } from 'react';
import { useAppSelector } from '../store/configureStore';
import type { ProductVariant } from '../models/product';

interface UseBasketItemProps {
  productId: number;
  selectedVariant?: ProductVariant;
}

export function useBasketItem({ productId, selectedVariant }: UseBasketItemProps) {
  const { basket } = useAppSelector((state) => state.basket);

  const basketItem = useMemo(() => {
    if (!basket?.items || !selectedVariant) return undefined;

    return basket.items.find((item) => {
      if (item.productId !== productId) return false;

      // If no attributes on either side, it's a match
      if (!item.attributes && !selectedVariant.attributes) return true;

      // If one has attributes and the other doesn't, no match
      if (!item.attributes || !selectedVariant.attributes) return false;

      // Check if all attributes match
      return item.attributes.every((itemAttr) =>
        selectedVariant.attributes!.some(
          (variantAttr) =>
            variantAttr.attributeName === itemAttr.attributeName &&
            variantAttr.attributeValue === itemAttr.attributeValue
        )
      ) && item.attributes.length === selectedVariant.attributes.length;
    });
  }, [basket?.items, productId, selectedVariant]);

  const itemQuantity = basketItem?.quantity || 0;
  const isInBasket = itemQuantity > 0;

  const getUpdatedQuantity = (newQuantity: number) => {
    return !basketItem ? newQuantity : newQuantity - basketItem.quantity;
  };

  return {
    basketItem,
    itemQuantity,
    isInBasket,
    getUpdatedQuantity
  };
}