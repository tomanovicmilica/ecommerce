import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import useProductTypes from '../../app/hooks/useCategory';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { categories, categoriesLoaded } = useProductTypes();

  // Helper function to get placeholder image for category
  const getCategoryImage = (categoryName: string) => {
    const imageMap: { [key: string]: string } = {
      'muška odeća': 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=300&h=400&fit=crop',
      'ženska odeća': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
      'obuća': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
      'aksesoari': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
      'sportska oprema': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop',
      'odeca': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=400&fit=crop',
      'torbe': '/images/products/bags.jpg',
      'majice' : '/images/products/shirt.jpg',
      'privesci': '/images/products/charm.jpg',
      'category-torbe': '/images/products/bags.jpg',
      'default': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop'
    };

    const key = categoryName.toLowerCase();
    return imageMap[key] || imageMap['default'];
  };

  // Map categories to include images
  const categoriesWithImages = categories.map(category => ({
    id: category.categoryId,
    name: category.name,
    image: getCategoryImage(category.name)
  }));

  // Auto-slide functionality
  useEffect(() => {
    if (categoriesWithImages.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(categoriesWithImages.length / 3));
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [categoriesWithImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(categoriesWithImages.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(categoriesWithImages.length / 3)) % Math.ceil(categoriesWithImages.length / 3));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] lg:h-[600px] bg-gradient-to-r from-brown to-dark-grey flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/backgrounds/hero-banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Moderni dodaci
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto">
            Otkrijte najnovije trendove u modi i pronađite savršen stil za sebe
          </p>
          <Link
            to="/catalog"
            className="inline-block bg-brown hover:bg-dark-grey text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Pogledaj kolekciju
          </Link>
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      </section>

      {/* Three Column Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-4">
              Zašto izabrati nas?
            </h2>
            <p className="text-lg text-light-grey max-w-2xl mx-auto">
              Pružamo vrhunsku uslugu i kvalitet koji možete da očekujete
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quality Assurance */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brown rounded-full mb-6 group-hover:bg-dark-grey transition-colors duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-grey mb-4">
                Garantovan kvalitet
              </h3>
              <p className="text-light-grey leading-relaxed">
                Svi naši proizvodi prolaze kroz striktnu kontrolu kvaliteta kako bismo garantovali vrhunsko iskustvo kupovine.
              </p>
            </div>

            {/* Fast Delivery */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brown rounded-full mb-6 group-hover:bg-dark-grey transition-colors duration-300">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-grey mb-4">
                Brza dostava
              </h3>
              <p className="text-light-grey leading-relaxed">
                Ekspresna dostava u roku od 24-48h. Besplatna dostava za sve porudžbine preko 5000 dinara.
              </p>
            </div>

            {/* Customer Satisfaction */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brown rounded-full mb-6 group-hover:bg-dark-grey transition-colors duration-300">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-grey mb-4">
                Zadovoljstvo kupaca
              </h3>
              <p className="text-light-grey leading-relaxed">
                Preko 10,000 zadovoljnih kupaca. Nudimo 30 dana garancije na povraćaj za sve proizvode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Slider Section */}
      <section className="py-16 bg-gray-50">
        {!categoriesLoaded ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-4">
                Kategorije proizvoda
              </h2>
              <p className="text-lg text-light-grey">
                Učitavamo kategorije...
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-light-grey animate-pulse rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : categoriesWithImages.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-4">
              Kategorije proizvoda
            </h2>
            <p className="text-lg text-light-grey">
              Trenutno nema dostupnih kategorija.
            </p>
          </div>
        ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-4">
              Kategorije proizvoda
            </h2>
            <p className="text-lg text-light-grey">
              Istražite našu široku ponudu kategorija
            </p>
          </div>

          <div className="relative">
            {/* Slider Container */}
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(categoriesWithImages.length / 3) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {categoriesWithImages.slice(slideIndex * 3, (slideIndex + 1) * 3).map((category) => (
                        <Link
                          key={category.id}
                          to={`/catalog?category=${category.name}`}
                          className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="aspect-[3/4] relative">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                              <h3 className="text-white text-xl font-bold mb-2 text-transform: uppercase">
                                {category.name}
                              </h3>
                              <span className="text-white/80 text-sm">
                                Pogledaj kolekciju →
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-dark-grey" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-dark-grey" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(categoriesWithImages.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentSlide === index ? 'bg-brown scale-125' : 'bg-light-grey hover:bg-beige'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        )}
      </section>
    </div>
  );
}