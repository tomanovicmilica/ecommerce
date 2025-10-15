import {
  ShoppingBag,
  Shield,
  Truck,
  Download,
  Users,
  Award,
  Leaf,
  Code,
  CheckCircle,
  Globe,
  Zap
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brown to-beige rounded-xl p-8 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">O našoj prodavnici</h1>
        <p className="text-xl opacity-90 max-w-3xl mx-auto">
          Gde se kvalitet susreće sa inovacijama. Prevazilazimo jaz između fizičke i digitalne trgovine, pružajući izuzetne proizvode i iskustva kupcima širom sveta.
        </p>
      </div>

      {/* Mission & Story */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-dark-grey mb-6">Naša priča</h2>
          <div className="space-y-4 text-dark-grey">
            <p>
              Osnovani sa vizijom da revolucionišemo kupovinu preko interneta, počeli smo kao mali tim strastveno posvećen spajanju najboljeg iz oba sveta - opipljivih proizvoda koje možete dodirnuti i digitalnih rešenja koja poboljšavaju vaš život.
            </p>
            <p>
               Danas smo izrasli u sveobuhvatnu platformu koja služi kupcima širom sveta, nudeći sve, od pažljivo odabranih fizičkih proizvoda do trenutnih digitalnih preuzimanja, a sve to uz pomoć najsavremenije tehnologije i nepokolebljive posvećenosti kvalitetu.
            </p>
            <p>
              Naše putovanje se nastavlja dok istražujemo nove načine da kupovinu učinimo praktičnijom, bezbednijom i prijatnijom za sve.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-beige/10 to-brown/5 rounded-xl p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-dark-grey">1K+</div>
              <div className="text-sm text-light-grey">Zadovoljnih korisnika</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-dark-grey">20+</div>
              <div className="text-sm text-light-grey">Proizvoda</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-light-grey rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-dark-grey">50+</div>
              <div className="text-sm text-light-grey">Država</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-dark-grey rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-dark-grey">99%</div>
              <div className="text-sm text-light-grey">Zadovoljstva</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Types */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-brown rounded-lg flex items-center justify-center mr-4">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark-grey">Fizički proizvodi</h3>
          </div>
          <p className="text-dark-grey mb-4">
            Pažljivo odabrani fizički artikli se isporučuju direktno na vaša vrata. 
            Od svakodnevnih potrepština do jedinstvenih nalaza, svaki proizvod je odabran 
            zbog kvaliteta i vrednosti.
          </p>
          <ul className="space-y-2 text-sm text-light-grey">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-brown mr-2" />
              Proizvodi sa garantovanim kvalitetom
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-brown mr-2" />
              Brza i sigurna isporuka
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-brown mr-2" />
              Jednostavan povraćaj i zamena
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-beige rounded-lg flex items-center justify-center mr-4">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark-grey">Digitalni proizvodi</h3>
          </div>
          <p className="text-dark-grey mb-4">
           Trenutni pristup digitalnom sadržaju, uključujući softver, e-knjige, kurseve i medije.
           Preuzmite odmah nakon kupovine uz bezbedan, vremenski ograničen pristup.
          </p>
          <ul className="space-y-2 text-sm text-light-grey">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-beige mr-2" />
              Odmah preuzmite sadržaj
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-beige mr-2" />
              Sigurni sistem dostave
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-beige mr-2" />
              Više pokušaja preuzimanja
            </li>
          </ul>
        </div>
      </div>

      {/* Values & Features */}
      <div>
        <h2 className="text-3xl font-bold text-dark-grey text-center mb-12">Zašto izabrati nas</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-brown/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-brown" />
            </div>
            <h3 className="text-xl font-bold text-dark-grey mb-3">Sigurni i pouzdani</h3>
            <p className="text-light-grey">
              Napredne bezbednosne mere štite vaše podatke i transakcije. 
              Kupujte sa poverenjem znajući da su vaši podaci bezbedni.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-beige/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-beige" />
            </div>
            <h3 className="text-xl font-bold text-dark-grey mb-3">Brzi</h3>
            <p className="text-light-grey">
              Brza obrada, brza dostava i trenutna digitalna dostava. 
              Dobijte ono što vam je potrebno kada vam je potrebno.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-light-grey/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-light-grey" />
            </div>
            <h3 className="text-xl font-bold text-dark-grey mb-3">Održivi izbor</h3>
            <p className="text-light-grey">
              Posvećeni smo smanjenju uticaja na životnu sredinu kroz efikasnu logistiku i promociju digitalnih alternativa.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="bg-gradient-to-r from-dark-grey to-brown rounded-xl p-8 text-white">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center mb-4">
              <Code className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Izgrađeno uz pomoć moderne tehnologije</h2>
            </div>
            <p className="mb-6 opacity-90">
              Naša platforma je izgrađena korišćenjem najsavremenije tehnologije kako bi se osiguralo najbolje 
              moguće iskustvo kupovine. Od responzivnog dizajna do bezbedne obrade plaćanja, svaki aspekt je 
              pažljivo osmišljen.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>• React & TypeScript</div>
              <div>• Ažuriranja u realnom vremenu</div>
              <div>• Sigurna autentifikacija</div>
              <div>• Prilagodljiv mobilnim uređajima</div>
              <div>• Napredna analitika</div>
              <div>• Klaud infrastruktura</div>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 rounded-full mb-4">
              <Code className="w-16 h-16" />
            </div>
            <p className="text-sm opacity-75">
              Neprestano se usavršavamo i razvijamo kako bismo vam bolje služili
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-beige/10 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-dark-grey mb-4">Spremni ste da počnete sa kupovinom?</h2>
        <p className="text-light-grey mb-6 max-w-2xl mx-auto">
          Otkrijte naš širok asortiman proizvoda i iskusite razliku koju kvalitet čini. 
          Pridružite se hiljadama zadovoljnih kupaca koji nam veruju za svoje potrebe kupovine.
        </p>
        <div className="space-x-4">
          <button className="px-8 py-3 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors">
            Pretraži proizvode
          </button>
          <button className="px-8 py-3 border border-brown text-brown rounded-lg hover:bg-brown hover:text-white transition-colors">
            Kontaktiraj nas
          </button>
        </div>
      </div>
    </div>
  );
}