import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  ShoppingBag,
  Users,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../app/store/configureStore';
import emailjs from '@emailjs/browser';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export default function ContactPage() {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.account);
  const form = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTrackOrder = () => {
    if (!user) {
      toast.info('Molimo Vas da se ulogujete kako biste pratili porudžbine');
      navigate('/login');
      return;
    }
    navigate('/orders');
  };

  const handleMyAccount = () => {
    if (!user) {
      toast.info('Molimo Vas ulogujte se kako biste pristupili nalogu');
      navigate('/login');
      return;
    }
    navigate('/profile');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await emailjs.sendForm(
        'service_ecdxzgj',
        'template_c8ar4kk',
        form.current!,
        'PttdNgUYQ2e5QDEcY'
      );
      toast.success('Poruka uspešno poslata! Ubrzo ćemo Vas kontaktirati.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      });
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast.error('Neuspešno slanje poruke. Molimo Vas pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Pošaljite email',
      description: 'Pošaljite nam email bilo kada',
      contact: 'support@ourstore.com',
      available: '24/7 Odgovori'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Pozovite nas',
      description: 'Razgovarajte sa našom korisničkom podrškom',
      contact: '+381 61 123 123',
      available: 'Pon-Pet 9:00-18:00'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Posetite nas',
      description: 'Dođite do našeg prodajnog mesta',
      contact: 'Bulevar Oslobođenja, Novi Sad',
      available: 'Pon-Pet 9:00-18:00'
    }
  ];

  const faqItems = [
    {
      question: 'Koje je vreme dostave?',
      answer: 'Standardna dostava traje 3-5 dana. Brza dostava podrazumeva isporuku sutradan.'
    },
    {
      question: 'Kako funkcionišu digitalni proizvodi?',
      answer: 'Nakon kupovine, dobićete linkove za preuzimanje. Preuzimanje je dostupno narednih 30 dana, i omogućeno je max 3 pokušaja preuzimanja.'
    },
    {
      question: 'Koja je politika povrata robe?',
      answer: 'Fizički proizvodi se mogu vratiti u roku od 30 dana. Digitalni proizvodi se ne mogu refundirati nakon kupovine.'
    },
    {
      question: 'Da li dostavljate internacionalno?',
      answer: 'Da, vršimo isporuku u preko 50 zemalja. Troškovi dostave i vremena isporuke zavise od lokacije.'
    },
    {
      question: 'Da li je moja uplata sigurna?',
      answer: 'Jeste, koristimo industrijski standard enkriptovanih i sigurnih procesora uplate kako bismo zaštitili vaše podatke. Yes, we use industry-standard encryption and secure payment processors to protect your information.'
    },
    {
      question: 'Kako mogu da pratim moju porudžbinu?',
      answer: 'Dobićete broj za praćenje putem email-a nakon što vaša porudžbina bude otpremljena. Takođe možete proveriti na vašem nalogu.'
    }
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brown to-beige rounded-xl p-8 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Kontaktirajte nas</h1>
        <p className="text-xl opacity-90 max-w-3xl mx-auto">
          Imate pitanje, potrebna vam je pomoć, ili želite da ostavite povratnu informaciju? Tu smo da pomognemo!
          Kontaktirajte nas putem bilo koje metode navedene ispod.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-8">
        {contactMethods.map((method, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-brown/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-brown">
                {method.icon}
              </div>
            </div>
            <h3 className="text-xl font-bold text-dark-grey mb-2">{method.title}</h3>
            <p className="text-light-grey mb-3">{method.description}</p>
            <p className="text-dark-grey font-medium mb-2">{method.contact}</p>
            <p className="text-sm text-beige">{method.available}</p>
          </div>
        ))}
      </div>

      {/* Contact Form & Info */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-8">
          <div className="flex items-center mb-6">
            <MessageSquare className="w-6 h-6 text-brown mr-3" />
            <h2 className="text-2xl font-bold text-dark-grey">Pošaljite nam poruku</h2>
          </div>

          <form ref={form} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark-grey mb-2">
                  Puno ime *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                  placeholder="Ime i prezime"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-grey mb-2">
                  Email adresa *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                  placeholder="primer@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-dark-grey mb-2">
                  Kategorija
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                >
                  <option value="general">Generalni upit</option>
                  <option value="support">Tehnička podrška</option>
                  <option value="orders">Problem sa porudžbinom</option>
                  <option value="returns">Povraćaj</option>
                  <option value="billing">Naplata</option>
                  <option value="partnership">Saradnja</option>
                </select>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-dark-grey mb-2">
                  Naslov *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                  placeholder="Kratak naslov vaše poruke"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-dark-grey mb-2">
                Poruka *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent resize-none"
                placeholder="Molimo Vas da navedete što više detalja..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brown text-white py-3 px-6 rounded-lg hover:bg-dark-grey disabled:bg-light-grey disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Slanje...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Pošalji poruku
                </>
              )}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="space-y-8">
          {/* Business Hours */}
          <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-beige mr-3" />
              <h3 className="text-xl font-bold text-dark-grey">Radno vreme</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-grey">Ponedeljak - Petak</span>
                <span className="text-light-grey">9:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-grey">Subota</span>
                <span className="text-light-grey">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-grey">Nedelja</span>
                <span className="text-light-grey">Neradna</span>
              </div>
              <div className="border-t border-light-grey/20 pt-2 mt-3">
                <div className="flex items-center text-brown">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">24/7 Email podrška dostupna</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-r from-beige/10 to-brown/5 rounded-xl p-6">
            <div className="space-y-3">
              <button
                onClick={handleTrackOrder}
                className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-beige/5 transition-colors border border-light-grey/20"
              >
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-brown mr-3" />
                  <div>
                    <p className="text-sm font-medium text-dark-grey">Prati porudžbinu</p>
                    <p className="text-xs text-light-grey">Prati notifikacije vezane za ažuriranje tvoje porudžbine</p>
                  </div>
                </div>
              </button>
              <button
                onClick={handleMyAccount}
                className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-beige/5 transition-colors border border-light-grey/20"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-beige mr-3" />
                  <div>
                    <p className="text-sm font-medium text-dark-grey">Moj nalog</p>
                    <p className="text-xs text-light-grey">Upravljaj nalogom</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => window.scrollTo({ top: document.getElementById('faq')?.offsetTop, behavior: 'smooth' })}
                className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-beige/5 transition-colors border border-light-grey/20"
              >
                <div className="flex items-center">
                  <HelpCircle className="w-5 h-5 text-light-grey mr-3" />
                  <div>
                    <p className="text-sm font-medium text-dark-grey">Help Center</p>
                    <p className="text-xs text-light-grey">Pregledaj naš FAQ</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-dark-grey mb-4">Najčešće postavljena pitanja</h2>
          <p className="text-light-grey max-w-2xl mx-auto">
            Pronađi odgovore na česta pitanja. Ne možeš da pronađeš ono što tražiš?
            Kontaktiraj nas putem forme iznad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-6">
              <div className="flex items-start mb-3">
                <HelpCircle className="w-5 h-5 text-brown mr-3 mt-0.5 flex-shrink-0" />
                <h3 className="text-lg font-medium text-dark-grey">{item.question}</h3>
              </div>
              <p className="text-light-grey ml-8">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-brown to-beige rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Još uvek ti je potrebna pomoć?</h2>
        <p className="mb-6 opacity-90 max-w-2xl mx-auto">
          Naš tim podrške spreman je da ti pomogne sa bilo kojim pitanjima ili problemima koje imaš.
          Kontaktiraj nas - tu smo da pomognemo kako bismo učinili tvoje iskustvo još boljim.
        </p>
        <div className="space-x-4">
          <button className="px-8 py-3 bg-white text-brown rounded-lg hover:bg-beige/10 transition-colors">
            Live Chat
          </button>
          <button className="px-8 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition-colors">
            Pozovi
          </button>
        </div>
      </div>
    </div>
  );
}