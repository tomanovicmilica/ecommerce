export default function ProductCardSkeleton() {
  return (
    <div className="w-full max-w-xs bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-3 w-4/5 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>

      {/* Image skeleton */}
      <div className="h-48 bg-gray-200"></div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center p-4">
        <div className="h-3 w-2/5 bg-gray-200 rounded"></div>
        <div className="h-3 w-1/5 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}