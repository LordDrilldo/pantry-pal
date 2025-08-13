import React from 'react';
import type { Notification } from '../types';
import { Icon } from './common/Icon';

interface NotificationsProps {
    notifications: Notification[];
    onClear: () => void;
    onClose: () => void;
}

const statusStyles: Record<Notification['status'], { icon: 'calendar' | 'bell', color: string }> = {
    SOON: { icon: 'bell', color: 'text-yellow-500' },
    EXPIRED: { icon: 'calendar', color: 'text-red-500' },
};

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onClear, onClose }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-30">
            <div className="p-4 flex justify-between items-center border-b">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                    <Icon name="x-circle" className="w-5 h-5 text-gray-400"/>
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                        <Icon name="check-circle" className="w-12 h-12 mx-auto text-green-400" />
                        <p className="mt-2">You're all caught up!</p>
                        <p className="text-sm">No new notifications.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map(notif => {
                             const style = statusStyles[notif.status];
                             return (
                                <li key={notif.id} className="p-4 flex items-start gap-3">
                                    <Icon name={style.icon} className={`w-5 h-5 mt-1 flex-shrink-0 ${style.color}`} />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{notif.title}</p>
                                        <p className="text-sm text-gray-600">{notif.message}</p>
                                    </div>
                                </li>
                             )
                        })}
                    </ul>
                )}
            </div>
             {notifications.length > 0 && (
                <div className="p-2 border-t">
                    <button 
                        onClick={onClear} 
                        className="w-full text-center text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-md py-1"
                    >
                        Clear all notifications
                    </button>
                </div>
             )}
        </div>
    );
};