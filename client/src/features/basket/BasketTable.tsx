import { Minus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { removeBasketItemAsync, addBasketItemAsync } from "./basketSlice";
import type { Item } from "../../app/models/basket";
import type { OrderItem } from "../../app/models/order";
import { useEffect, useState } from "react";
import agent from "../../app/api/agent";

interface Props {
  items: (Item | OrderItem)[];
  isBasket?: boolean;
}

export default function BasketTable({ items, isBasket = true }: Props) {
  const { status } = useAppSelector((state) => state.basket);
  const dispatch = useAppDispatch();
  const [stockInfo, setStockInfo] = useState<Record<string, number>>({});
  const [attributeInfo, setAttributeInfo] = useState<Record<string, string>>({});
  const [variantData, setVariantData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchStockAndAttributeInfo = async () => {
      const stockData: Record<string, number> = {};
      const attrData: Record<string, string> = {};
      const variantDataMap: Record<string, any> = {};

      for (const item of items) {
        const key = `${item.productId}-${item.productVariantId || item.attributeValueIds?.join('-') || 'default'}`;

        // Skip if we already have data for this item
        if (stockData[key] && attrData[key]) continue;

        try {
          const product = await agent.Catalog.details(item.productId);
          if (product && product.variants) {
            // First try to find variant by productVariantId if available
            let variant = item.productVariantId
              ? product.variants.find((v: any) => v.productVariantId === item.productVariantId)
              : undefined;

            // Fallback to finding by attributeValueIds if productVariantId didn't work
            if (!variant && item.attributeValueIds?.length) {
              variant = product.variants.find((v: any) =>
                v.attributeValueIds &&
                item.attributeValueIds &&
                v.attributeValueIds.length === item.attributeValueIds.length &&
                v.attributeValueIds.every((id: number) => item.attributeValueIds!.includes(id))
              );
            }

            if (variant) {
              stockData[key] = variant.quantityInStock;
              variantDataMap[key] = variant; // Store the full variant data

              // Build attribute display string from variant
              if (variant.attributes && variant.attributes.length > 0) {
                const attrString = variant.attributes
                  .map((attr: any) => attr.attributeValue)
                  .join(', ');
                attrData[key] = attrString;
              } else {
                // Fallback: try to use item's attributes if available
                if (item.attributes && item.attributes.length > 0) {
                  const attrString = item.attributes
                    .map((attr) => attr.attributeValue)
                    .join(', ');
                  attrData[key] = attrString;
                }
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch data for product ${item.productId}:`, error);

          // Fallback: use item's own attributes if available
          if (item.attributes && item.attributes.length > 0) {
            const attrString = item.attributes
              .map((attr) => attr.attributeValue)
              .join(', ');
            attrData[key] = attrString;
          }
        }
      }

      setStockInfo(prevStock => ({ ...prevStock, ...stockData }));
      setAttributeInfo(prevAttr => ({ ...prevAttr, ...attrData }));
      setVariantData(prevVariant => ({ ...prevVariant, ...variantDataMap }));
    };

    if (items.length > 0) {
      fetchStockAndAttributeInfo();
    }
  }, [items]);

  const getStockForItem = (item: Item | OrderItem): number => {
    const key = `${item.productId}-${(item as Item).productVariantId || item.attributeValueIds?.join('-') || 'default'}`;
    return stockInfo[key] || 0;
  };

  const getAttributesForItem = (item: Item | OrderItem): string => {
    // First try to use the attributes from the item itself
    if (item.attributes?.length) {
      return item.attributes.map((a) => a.attributeValue).join(", ");
    }

    // Then try fetched attribute info
    const key = `${item.productId}-${(item as Item).productVariantId || item.attributeValueIds?.join('-') || 'default'}`;
    const fetchedAttributes = attributeInfo[key];
    if (fetchedAttributes) {
      return fetchedAttributes;
    }

    // If we have attributeValueIds but no attributes resolved yet, show loading
    if (item.attributeValueIds?.length) {
      return "Loading...";
    }

    // Only show "Standardni" for items that truly have no variants
    return "Standardni";
  };

  const getAttributeValueIdsForItem = (item: Item | OrderItem): number[] => {
    // First try to use existing attributeValueIds
    if (item.attributeValueIds?.length) {
      return item.attributeValueIds;
    }

    // Try to get from variant data if we have productVariantId
    const key = `${item.productId}-${(item as Item).productVariantId || item.attributeValueIds?.join('-') || 'default'}`;
    const variant = variantData[key];
    if (variant?.attributeValueIds) {
      return variant.attributeValueIds;
    }

    return [];
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={`${item.productId}-${(item as Item).productVariantId || item.attributeValueIds?.join('-') || Math.random()}`}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <img
                className="h-20 w-20 object-cover rounded-lg"
                src={item.imageUrl || '/placeholder-image.png'}
                alt={item.name}
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>

              {/* Variant */}
              <p className="text-sm text-gray-600 mb-2">
                {getAttributesForItem(item)}
              </p>

              {/* Quantity Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Količina:</label>
                <select
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value);
                    const currentQuantity = item.quantity;
                    const difference = newQuantity - currentQuantity;

                    if (difference > 0) {
                      // Add items
                      dispatch(
                        addBasketItemAsync({
                          productId: item.productId,
                          quantity: difference,
                          attributeValueIds: getAttributeValueIdsForItem(item),
                        })
                      );
                    } else if (difference < 0) {
                      // Remove items
                      dispatch(
                        removeBasketItemAsync({
                          productId: item.productId,
                          attributeValueIds: getAttributeValueIdsForItem(item),
                          quantity: Math.abs(difference),
                        })
                      );
                    }
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  disabled={
                    status === "pendingAddItem" + item.productId + ((item as Item).productVariantId || item.attributeValueIds?.join('-') || '') ||
                    status === "pendingRemoveItem" + item.productId + ((item as Item).productVariantId || item.attributeValueIds?.join('-') || '')
                  }
                >
                  {Array.from({ length: Math.min(getStockForItem(item), 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price and Remove */}
            <div className="flex flex-col items-end justify-between">
              {/* Price */}
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {(item.price * item.quantity)} rsd
                </p>
                <p className="text-sm text-gray-500">
                  {item.price} rsd/kom
                </p>
              </div>

              {/* Remove Button */}
              {isBasket && (
                <button
                  className="p-2 text-brown hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() =>
                    dispatch(
                      removeBasketItemAsync({
                        productId: item.productId,
                        attributeValueIds: getAttributeValueIdsForItem(item),
                        quantity: item.quantity,
                      })
                    )
                  }
                  disabled={
                    status === "pendingRemoveItem" + item.productId + ((item as Item).productVariantId || item.attributeValueIds?.join('-') || '')
                  }
                  title="Ukloni iz korpe"
                >
                  <Minus size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}