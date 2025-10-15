import { useFormContext } from "react-hook-form";

export default function AddressForm() {
  const { register, formState: { errors, isDirty } } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping address</h2>

      <div className="grid grid-cols-1 gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full name *
          </label>
          <input
            id="fullName"
            type="text"
            {...register("fullName")}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message as string}</p>
          )}
        </div>

        {/* Address 1 */}
        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
            Address line 1 *
          </label>
          <input
            id="address1"
            type="text"
            {...register("address1")}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.address1 ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address1 && (
            <p className="mt-1 text-sm text-red-600">{errors.address1.message as string}</p>
          )}
        </div>

        {/* Address 2 */}
        <div>
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
            Address line 2
          </label>
          <input
            id="address2"
            type="text"
            {...register("address2")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Address 3 */}
        <div>
          <label htmlFor="address3" className="block text-sm font-medium text-gray-700 mb-1">
            Address line 3
          </label>
          <input
            id="address3"
            type="text"
            {...register("address3")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              id="city"
              type="text"
              {...register("city")}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message as string}</p>
            )}
          </div>

          {/* ZIP Code */}
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP code *
            </label>
            <input
              id="zip"
              type="text"
              {...register("zip")}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.zip ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.zip && (
              <p className="mt-1 text-sm text-red-600">{errors.zip.message as string}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div className="sm:w-1/2">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <input
            id="country"
            type="text"
            {...register("country")}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message as string}</p>
          )}
        </div>

        {/* Save Address Checkbox */}
        <div className="flex items-center">
          <input
            id="saveAddress"
            type="checkbox"
            disabled={!isDirty}
            {...register("saveAddress")}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor="saveAddress" className={`ml-2 block text-sm ${
            isDirty ? 'text-gray-900' : 'text-gray-400'
          }`}>
            Save this as the default address
          </label>
        </div>
      </div>
    </div>
  );
}