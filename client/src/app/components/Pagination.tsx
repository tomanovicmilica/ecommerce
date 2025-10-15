import { ChevronLeft, ChevronRight } from "lucide-react";

interface MetaData {
  totalPages: number;
  currentPage: number;
}

interface Props {
  metaData: MetaData;
  onPageChange: (page: number) => void;
}

export default function Pagination({ metaData, onPageChange }: Props) {
  const { currentPage, totalPages } = metaData;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:text-brown hover:bg-gray-100"
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentPage === i + 1
                ? "bg-brown text-white"
                : "text-gray-600 hover:text-brown hover:bg-light-grey"
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:text-brown hover:bg-gray-100"
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Divider Line */}
      <div className="w-full border-t border-gray-200"></div>
    </div>
  );
}