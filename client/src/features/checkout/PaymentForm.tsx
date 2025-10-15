import { useFormContext } from "react-hook-form";
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import type { StripeElementType } from "@stripe/stripe-js";

interface Props {
  cardState: {elementError: {[key in StripeElementType]?: string}},
  onCardInputChange: (event: any) => void;
}

export default function PaymentForm({cardState, onCardInputChange}: Props) {
  const { register, formState: { errors } } = useFormContext();

  const stripeElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
      },
    },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment method</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name on Card */}
        <div className="md:col-span-1">
          <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-1">
            Name on card *
          </label>
          <input
            id="nameOnCard"
            type="text"
            {...register("nameOnCard")}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.nameOnCard ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nameOnCard && (
            <p className="mt-1 text-sm text-red-600">{errors.nameOnCard.message as string}</p>
          )}
        </div>

        {/* Card Number */}
        <div className="md:col-span-1">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card number *
          </label>
          <div className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
            cardState.elementError.cardNumber ? 'border-red-500' : 'border-gray-300'
          }`}>
            <CardNumberElement
              id="cardNumber"
              onChange={onCardInputChange}
              options={stripeElementOptions}
            />
          </div>
          {cardState.elementError.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{cardState.elementError.cardNumber}</p>
          )}
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="expDate" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry date *
          </label>
          <div className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
            cardState.elementError.cardExpiry ? 'border-red-500' : 'border-gray-300'
          }`}>
            <CardExpiryElement
              id="expDate"
              onChange={onCardInputChange}
              options={stripeElementOptions}
            />
          </div>
          {cardState.elementError.cardExpiry && (
            <p className="mt-1 text-sm text-red-600">{cardState.elementError.cardExpiry}</p>
          )}
        </div>

        {/* CVV */}
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
            CVV *
          </label>
          <div className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
            cardState.elementError.cardCvc ? 'border-red-500' : 'border-gray-300'
          }`}>
            <CardCvcElement
              id="cvv"
              onChange={onCardInputChange}
              options={stripeElementOptions}
            />
          </div>
          {cardState.elementError.cardCvc && (
            <p className="mt-1 text-sm text-red-600">{cardState.elementError.cardCvc}</p>
          )}
        </div>
      </div>
    </div>
  );
}