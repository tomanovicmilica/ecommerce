import { useMemo } from 'react';
import type { Product, ProductVariant } from '../models/product';

export function useProductVariants(product: Product | undefined) {
  const attributeMap = useMemo(() => {
    const map: Record<string, string[]> = {};

    if (!product?.variants) return map;

    product.variants.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        if (!map[attr.attributeName]) map[attr.attributeName] = [];
        if (!map[attr.attributeName].includes(attr.attributeValue)) {
          map[attr.attributeName].push(attr.attributeValue);
        }
      });
    });

    return map;
  }, [product?.variants]);

  const findVariantByAttributes = useMemo(() => {
    return (selectedAttributes: Record<string, string>): ProductVariant | undefined => {
      if (!product?.variants) return undefined;

      return product.variants.find((variant) => {
        if (!variant.attributes || variant.attributes.length !== Object.keys(selectedAttributes).length) {
          return false;
        }

        return variant.attributes.every(attr =>
          selectedAttributes[attr.attributeName] === attr.attributeValue
        );
      });
    };
  }, [product?.variants]);

  const hasVariants = product?.variants && product.variants.length > 0;
  const attributeNames = Object.keys(attributeMap);

  return {
    attributeMap,
    findVariantByAttributes,
    hasVariants,
    attributeNames
  };
}