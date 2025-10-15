import { useAppSelector } from "../../app/store/configureStore";
import BasketTable from "../basket/BasketTable";
import BasketSummary from "../basket/BasketSummary";

export default function Review() {
  const {basket} = useAppSelector(state => state.basket);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order summary</h2>

      {basket && (
        <div className="mb-6">
          <BasketTable items={basket.items} isBasket={false} />
        </div>
      )}

      <div className="flex justify-end">
        <div className="w-full md:w-1/2">
          <BasketSummary />
        </div>
      </div>
    </div>
  );
}