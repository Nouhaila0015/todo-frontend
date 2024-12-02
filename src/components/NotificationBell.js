import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import axios from 'axios';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('http://localhost:3001/notifications', {
                withCredentials: true
            });
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Rafraîchir les notifications toutes les 30 secondes
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAcceptInvitation = async (notification) => {
        try {
            await axios.put(
                `/notifications/${notification.id_notification}/accept`,
                {},
                { withCredentials: true }
            );
            fetchNotifications();
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleDeclineInvitation = async (notification) => {
        try {
            await axios.put(
                `http://localhost:3001/notifications/${notification.id_notification}/decline`,
                {},
                { withCredentials: true }
            );
            fetchNotifications();
        } catch (error) {
            console.error('Error declining invitation:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(
                `http://localhost:3001/notifications/${notificationId}/read`,
                {},
                { withCredentials: true }
            );
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(
                'http://localhost:3001/notifications/read-all',
                {},
                { withCredentials: true }
            );
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
                <Bell size={20} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.filter(n => !n.isRead).length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-gray-900">Notifications</h3>
                            {notifications.some(n => !n.isRead) && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[80vh] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id_notification}
                                    className={`p-4 border-b ${!notification.isRead ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                                >
                                    <div className="flex justify-between">
                                        <p className="text-gray-900">{notification.message}</p>
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification.id_notification)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    {notification.type === 'PROJECT_INVITATION' && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleAcceptInvitation(notification)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-md"
                                            >
                                                Accepter
                                            </button>
                                            <button
                                                onClick={() => handleDeclineInvitation(notification)}
                                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md"
                                            >
                                                Refuser
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                Aucune notification
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;