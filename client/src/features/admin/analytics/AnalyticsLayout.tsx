import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Package, Users } from 'lucide-react';

interface Props {
    children: React.ReactNode;
}

export default function AnalyticsLayout({ children }: Props) {
    const location = useLocation();

    const analyticsNavigation = [
        { name: 'Sales Analytics', href: '/admin/analytics/sales', icon: BarChart3 },
        { name: 'Product Analytics', href: '/admin/analytics/products', icon: Package },
        { name: 'Customer Analytics', href: '/admin/analytics/customers', icon: Users },
    ];

    const isCurrentPath = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div>
            {/* Analytics Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    {analyticsNavigation.map((item) => {
                        const Icon = item.icon;
                        const current = isCurrentPath(item.href);

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    current
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className={`mr-2 h-5 w-5 ${
                                    current ? 'text-indigo-500' : 'text-gray-400'
                                }`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Analytics Content */}
            {children}
        </div>
    );
}