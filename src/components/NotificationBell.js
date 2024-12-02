import React, { useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications] = useState([
        // Données de test
        { id: 1, message: "Test notification", isRead: false },
        { id: 2, message: "Autre notification", isRead: true }
    ]);

    return (
        <div className="relative">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex items-center ml-auto"
        >
            <Bell size={20} className="text-gray-700 hover:text-gray-900" />
            {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                </span>
            )}
        </button>

        {isOpen && (
            <div className="fixed right-4 top-16 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-[80vh] overflow-y-auto">
                    {notifications.map(notification => (
                        <div 
                            key={notification.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        >
                            <p className="text-gray-800">{notification.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
    );
};

export default NotificationBell;