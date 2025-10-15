import { Menu, ShoppingBag, X, Settings, Search, User, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/configureStore";
import { useWishlist } from "../hooks/useWishlist";
import SignedInMenu from "./SignedInMenu";
import SearchModal from "../../components/Search/SearchModal";

export default function Header() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const location = useLocation();
    const {basket} = useAppSelector(state => state.basket);
    const {user} = useAppSelector(state => state.account);
    const { wishlistCount } = useWishlist();
    const itemCount = basket?.items.reduce((sum, item) => sum + item.quantity, 0);

    const isAdmin = user?.roles?.includes('Admin');

    const navLinks = [
        { name: "Početna", path: "/home" },
        { name: "Proizvodi", path: "/catalog" },
        { name: "O nama", path: "/about" },
        { name: "Kontakt", path: "/contact" },
    ];

    const authLinks = [
        { name: "Uloguj se", path: "/login" },
        { name: "Registruj se", path: "/register" },
    ];

    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex h-16 items-center">
          {/* Left: Hamburger Menu (Mobile Only) */}
          <button
            className="p-2 rounded-md hover:bg-gray-100 transition md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Left: Empty space for balance (Desktop Only) */}
          <div className="flex-1 hidden md:block"></div>

          {/* Center: Title/Logo */}
          <Link to="/home" className="text-2xl font-serif-bold text-shadow-brown hover:text-light-grey transition-colors">
            b l i s s k a
          </Link>

          {/* Right: Icons */}
          <div className="flex-1 flex items-center justify-end space-x-3">
            {/* Search Icon */}
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition relative group"
                onClick={() => setSearchOpen(true)}
                title="Search (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-gray-700" />
                {/* Keyboard shortcut hint */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Ctrl+K
                </div>
              </button>

              {/* Search Modal */}
              <SearchModal
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
              />
            </div>

            {/* Shopping Actions - Hidden for Admin Users */}
            {!isAdmin && (
              <>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative p-2 rounded-full hover:bg-gray-100 transition"
                  title="Wishlist"
                >
                  <Heart className="w-4 h-4 text-gray-700" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-dark-grey text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Shopping Cart */}
                <Link
                  to="/basket"
                  className="relative p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <ShoppingBag className="w-4 h-4 text-gray-700" />
                  {itemCount! > 0 && (
                    <span className="absolute -top-1 -right-1 bg-dark-grey text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* User Icon/Menu */}
            {user ? (
              <SignedInMenu />
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <User className="w-4 h-4 text-gray-700" />
              </Link>
            )}

            {/* Admin Panel Button (if admin) */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`p-2 rounded-full hover:bg-gray-100 transition ${
                  location.pathname.startsWith('/admin')
                    ? "bg-white text-brown"
                    : "text-gray-700"
                }`}
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Links Bar (Desktop Only) */}
        <div className="border-t border-gray-200 hidden md:block">
          <nav className="flex justify-center space-x-8 py-3">
            {navLinks.map((link) => (
              <Link
                to={link.path}
                key={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.path
                    ? "text-brown bg-indigo-50"
                    : "text-gray-700 hover:text-light-grey hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="bg-white shadow-lg border-t border-gray-200 md:hidden">
          {/* Navigation Links */}
          <nav className="flex flex-col p-4 space-y-3 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-500 tracking-wide mb-2">
              Navigacija
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-md transition-colors ${
                  location.pathname === link.path
                    ? "text-dark-grey bg-light-grey font-medium"
                    : "text-gray-700 hover:text-brown hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex flex-col p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-500 tracking-wide mb-2">
              Nalog
            </div>
            {user ? (
              <div className="space-y-3">
                {!isAdmin && (
                  <Link
                    to="/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      location.pathname === "/wishlist"
                        ? "text-indigo-600 bg-indigo-50 font-medium"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>Wishlist ({wishlistCount})</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    location.pathname === "/profile"
                      ? "text-indigo-600 bg-indigo-50 font-medium"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  Profil
                </Link>
                {!isAdmin && (
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      location.pathname === "/orders"
                        ? "text-indigo-600 bg-indigo-50 font-medium"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    }`}
                  >
                    My Orders
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? "text-indigo-600 bg-indigo-50 font-medium"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            ) : (
              authLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    location.pathname === link.path
                      ? "text-indigo-600 bg-indigo-50 font-medium"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
}