import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, User, Package, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import { signOut } from "../../features/account/accountSlice";
import { clearBasket } from "../../features/basket/basketSlice";

export default function SignedInMenu() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.account);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    dispatch(signOut());
    dispatch(clearBasket());
    handleClose();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 text-black hover:text-gray-200 transition-colors py-2 px-3 rounded-md"
      >
        <span className="text-sm font-medium">Ćao, {user?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <Link
            to="/profile"
            onClick={handleClose}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <User className="w-4 h-4 mr-3" />
            Profil
          </Link>
          <Link
            to="/orders"
            onClick={handleClose}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Package className="w-4 h-4 mr-3" />
            Moje porudžbine
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Odjavi se
          </button>
        </div>
      )}
    </div>
  );
}