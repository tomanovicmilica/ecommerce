import { Link } from "react-router-dom";
import BasketSummary from "././BasketSummary";
import { useAppSelector } from "../../app/store/configureStore";
import BasketTable from "./BasketTable";

export default function BasketPage() {
  const { basket } = useAppSelector((state) => state.basket);

  if (!basket) {
    return (
      <h3 className="text-2xl font-semibold text-gray-700 text-center mt-10">
        Your basket is empty
      </h3>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Products - 2/3 width */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-semibold mb-6">Vaša korpa</h2>
        <BasketTable items={basket.items} />
      </div>

      {/* Right: Summary - 1/3 width */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Ukupno</h3>
        <BasketSummary />
        <Link
          to="/checkout"
          className="block w-full bg-brown text-white text-center py-3 rounded-lg text-lg font-medium hover:bg-dark-grey transition"
        >
          Nastavi
        </Link>
        <Link
          to="/catalog"
          className="block w-full bg-transparent text-brown text-center py-3 text-base font-medium transition"
        >
          Vrati se na proizvode
        </Link>
      </div>
    </div>
  );
}