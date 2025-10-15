import { useState } from "react";
import { User, MapPin, Shield, Download } from "lucide-react";
import { useAppSelector } from "../../app/store/configureStore";
import ProfilePage from "./ProfilePage";
import DigitalDownloadsPage from "./DigitalDownloadsPage";
import AddressesPage from "./AddressesPage";
import SecurityPage from "./SecurityPage";

type AccountSection = 'personal' | 'addresses' | 'security' | 'downloads';

export default function AccountLayout() {
    const { user } = useAppSelector(state => state.account);
    const [activeSection, setActiveSection] = useState<AccountSection>('personal');

    const menuItems = [
        {
            id: 'personal' as AccountSection,
            label: 'Lični podaci',
            icon: User,
            description: 'Upravljajte svojim ličnim podacima'
        },
        {
            id: 'downloads' as AccountSection,
            label: 'Digitalni proizvodi',
            icon: Download,
            description: 'Vaši kupljeni digitalni proizvodi'
        },
        {
            id: 'addresses' as AccountSection,
            label: 'Adrese za dostavu',
            icon: MapPin,
            description: 'Sačuvane adrese za dostavu'
        },
        {
            id: 'security' as AccountSection,
            label: 'Bezbednost',
            icon: Shield,
            description: 'Lozinka i bezbednosna podešavanja'
        }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'personal':
                return <ProfilePage />;
            case 'downloads':
                return <DigitalDownloadsPage />;
            case 'addresses':
                return <AddressesPage />;
            case 'security':
                return <SecurityPage />;
            default:
                return <ProfilePage />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-8 p-6">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="lg:w-80 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-lg border border-light-grey p-6 sticky top-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-serif-bold text-dark-grey mb-1">
                                {user?.name ? `${user.name} ${user.lastName || ''}`.trim() : 'Korisnik'}
                            </h1>
                            <p className="text-gray-600 text-sm">{user?.email}</p>
                        </div>

                        <nav className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                                            isActive
                                                ? 'bg-brown text-white shadow-lg'
                                                : 'hover:bg-light-brown/10 text-dark-grey'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brown'}`} />
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}