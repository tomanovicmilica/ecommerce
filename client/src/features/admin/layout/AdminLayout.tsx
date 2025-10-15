import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    Menu,
    X,
    Folder,
    Warehouse,
    Shield,
    Tag
} from 'lucide-react';
// import AdminNotifications from '../components/AdminNotifications';

interface Props {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Proizvodi', href: '/admin/products', icon: Package },
        { name: 'Kategorije', href: '/admin/categories', icon: Folder },
        { name: 'Atributi', href: '/admin/attributes', icon: Tag },
        { name: 'Zalihe', href: '/admin/inventory', icon: Warehouse },
        { name: 'Porudžbine', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Korisnici', href: '/admin/users', icon: Users },
        /* { name: 'Analitika', href: '/admin/analytics/sales', icon: BarChart3 }, */
        /* { name: 'Podešavanja', href: '/admin/settings/system', icon: Settings }, */
        { name: 'Roles & Permissions', href: '/admin/rbac/users', icon: Shield },
    ];

    const isCurrentPath = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-dark-grey bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-brown to-dark-grey shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-light-grey/20">
                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    <div className="flex items-center space-x-3">
                        {/* <AdminNotifications /> */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-md text-light-grey hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const current = isCurrentPath(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        current
                                            ? 'bg-beige/20 text-beige border border-beige/30'
                                            : 'text-light-grey hover:text-white hover:bg-white/10'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className={`mr-3 h-5 w-5 transition-colors ${
                                        current ? 'text-beige' : 'text-light-grey group-hover:text-white'
                                    }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-light-grey/20">
                    <Link
                        to="/catalog"
                        className="flex items-center px-3 py-2 text-xs font-medium text-light-grey rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                    >
                        ← Povratak na prodavnicu
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:pl-64">
                {/* Top bar */}
                <div className="lg:hidden">
                    <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-light-grey/30">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-light-grey hover:text-brown hover:bg-beige/10 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-dark-grey">Admin Panel</h1>
                        {/* <AdminNotifications /> */}
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 bg-gradient-to-br from-white to-beige/5">
                    {children}
                </main>
            </div>
        </div>
    );
}