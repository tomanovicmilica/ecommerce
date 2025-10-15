import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export default function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
    const colorClasses = {
        primary: 'bg-brown',
        secondary: 'bg-beige',
        accent: 'bg-light-grey',
        neutral: 'bg-dark-grey',
    };

    const changeColor = change && change >= 0 ? 'text-brown' : 'text-red-600';
    const ChangeIcon = change && change >= 0 ? TrendingUp : TrendingDown;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-light-grey mb-2">{title}</p>
                    <p className="text-3xl font-bold text-dark-grey">{value}</p>
                    {change !== undefined && (
                        <div className={`flex items-center mt-3 ${changeColor}`}>
                            <ChangeIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                                {Math.abs(change).toFixed(1)}%
                            </span>
                            <span className="text-xs text-light-grey ml-2">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]} text-white shadow-sm`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}