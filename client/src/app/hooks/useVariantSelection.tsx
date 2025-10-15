import { useState, useMemo, useCallback } from 'react';
import type { ProductVariant } from '../models/product';

interface UseVariantSelectionProps {
  attributeMap: Record<string, string[]>;
  findVariantByAttributes: (selectedAttributes: Record<string, string>) => ProductVariant | undefined;
}

export function useVariantSelection({ attributeMap, findVariantByAttributes }: UseVariantSelectionProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const allAttributesSelected = useMemo(() => {
    const attributeNames = Object.keys(attributeMap);
    return attributeNames.length > 0 &&
           attributeNames.every((name) => selectedAttributes[name]);
  }, [attributeMap, selectedAttributes]);

  const selectedVariant = useMemo(() => {
    if (!allAttributesSelected) return undefined;
    return findVariantByAttributes(selectedAttributes);
  }, [selectedAttributes, allAttributesSelected, findVariantByAttributes]);

  const handleAttributeSelect = useCallback((attrName: string, attrValue: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: attrValue,
    }));
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedAttributes({});
  }, []);

  const isAttributeSelected = useCallback((attrName: string, attrValue: string) => {
    return selectedAttributes[attrName] === attrValue;
  }, [selectedAttributes]);

  return {
    selectedAttributes,
    selectedVariant,
    allAttributesSelected,
    handleAttributeSelect,
    resetSelection,
    isAttributeSelected
  };
}