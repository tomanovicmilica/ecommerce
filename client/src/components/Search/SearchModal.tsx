import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import searchAgent, { type SearchResult } from '../../app/api/searchAgent';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search function using API
  const searchSite = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];
    return await searchAgent.searchAll(searchQuery);
  };

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchSite(query);
        setResults(searchResults);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.search-dropdown')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            window.location.href = results[selectedIndex].url;
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, results]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product':
        return '🛍️';
      case 'category':
        return '📁';
      case 'page':
        return '📄';
      default:
        return '🔍';
    }
  };

  const handleResultClick = () => {
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="search-dropdown absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="relative">
          {/* Search Input */}
          <div className="flex items-center p-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pretrazi proizvode..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm border-none outline-none bg-transparent"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            ) : query.trim().length < 2 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Pocni da kucas da pretrazis...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <Link
                    key={result.id}
                    to={result.url}
                    onClick={() => handleResultClick()}
                    className={`flex items-center p-4 hover:bg-gray-50 transition ${
                      index === selectedIndex ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
                    }`}
                  >
                    <span className="text-2xl mr-3">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h3>
                        {result.price && (
                          <span className="ml-2 text-sm font-semibold text-indigo-600">
                            ${result.price}
                          </span>
                        )}
                      </div>
                      {result.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {result.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 capitalize">
                        {result.type}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">😕</div>
                <p className="text-gray-600 mb-2">No results found</p>
                <p className="text-sm text-gray-500">
                  Try searching for products, categories, or pages
                </p>
              </div>
            )}
          </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        )}
      </div>
    </div>
  );
}