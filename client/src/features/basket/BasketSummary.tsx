import { currencyFormat } from "../../app/util/util";
import { useAppSelector } from "../../app/store/configureStore";
import { ProductType } from "../../app/models/product";

interface Props {
  subtotal?: number;
}

export default function BasketSummary({ subtotal }: Props) {
  const { basket } = useAppSelector((state) => state.basket);

  if (subtotal === undefined)
    subtotal =
      basket?.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ) ?? 0;

  // Check if all items in basket are digital products
  const allItemsDigital = basket?.items.every(item => item.productType === ProductType.Digital) ?? false;

  // Delivery fee is 0 if all items are digital, or if subtotal > 5999
  const deliveryFee = allItemsDigital ? 0 : (subtotal > 5999 ? 0 : 500);

  return (
    <div className="space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">{currencyFormat(subtotal)}</span>
      </div>

      {/* Delivery fee */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Dostava*</span>
        <span className="font-medium">{currencyFormat(deliveryFee)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-3"></div>

      {/* Total */}
      <div className="flex justify-between items-center font-semibold text-lg">
        <span>Ukupno</span>
        <span>{currencyFormat(subtotal + deliveryFee)}</span>
      </div>

      {/* Note */}
      <div className="text-xs text-gray-500 italic mt-2">
        {allItemsDigital
          ? "*Besplatna dostava za digitalne proizvode"
          : "*Besplatna dostava za porudžbine preko 6000 rsd"}
      </div>
    </div>
  );
}