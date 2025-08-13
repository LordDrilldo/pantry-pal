import React, { useState } from 'react';
import type { User, Notification } from '../types';
import { Icon } from './common/Icon';
import { Notifications } from './Notifications';

interface NavbarProps {
    user: User;
    onLogout: () => void;
    notifications: Notification[];
    onClearNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, notifications, onClearNotifications }) => {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="bg-white shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Icon name="chef-hat" className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Pantry Pal</h1>
                        <p className="text-sm text-gray-500 -mt-1">Your AI-Powered Kitchen Assistant</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors"
                            aria-label="Toggle notifications"
                        >
                            <Icon name="bell" className="w-6 h-6" />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <Notifications 
                                notifications={notifications} 
                                onClear={onClearNotifications} 
                                onClose={() => setShowNotifications(false)}
                            />
                        )}
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700">{user.email}</p>
                    </div>
                     <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};