import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-grey text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif-bold text-beige">c r a f t</h3>
            <p className="text-gray-300 text-xs">
              Ručno rađeni proizvodi sa ljubavlju i pažnjom za detalje.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-beige transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-beige transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-beige">Brze veze</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-gray-300 hover:text-beige transition-colors text-xs">
                  Početna
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-300 hover:text-beige transition-colors text-xs">
                  Proizvodi
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-beige transition-colors text-xs">
                  O nama
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-beige transition-colors text-xs">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-beige">Korisnička služba</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-beige transition-colors text-xs">
                  Moje porudžbine
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-300 hover:text-beige transition-colors text-xs">
                  Lista želja
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-beige transition-colors text-xs">
                  Moj profil
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-beige transition-colors text-xs">
                  Pomoć
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-beige">Kontakt</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-beige" />
                <span className="text-gray-300 text-xs">info@craft.rs</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-beige" />
                <span className="text-gray-300 text-xs">+381 xx xxx xxxx</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-beige" />
                <span className="text-gray-300 text-xs">Beograd, Srbija</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-600 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-xs">
              © 2024 craft. Sva prava zadržana.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-beige transition-colors text-xs">
                Privatnost
              </a>
              <a href="#" className="text-gray-400 hover:text-beige transition-colors text-xs">
                Uslovi korišćenja
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}