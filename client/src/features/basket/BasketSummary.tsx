import { currencyFormat } from "../../app/util/util";
import { useAppSelector } from "../../app/store/configureStore";

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

  const deliveryFee = subtotal > 5999 ? 0 : 500;

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
        *Besplatna dostava za porudžbine preko 6000 rsd
      </div>
    </div>
  );
}