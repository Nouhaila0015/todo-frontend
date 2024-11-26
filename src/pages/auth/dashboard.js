import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await axios.get('http://localhost:3001/utilisateurs/verify-session', { withCredentials: true });
                setUser(res.data.user);
            } catch {
                setMessage('Please log in to continue.');
            }
        };
        verifySession();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-96 text-center">
                {user ? (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-700">Welcome, {user.username}</h1>
                        <p className="text-gray-600 mt-2">You are now logged into your dashboard.</p>
                    </>
                ) : (
                    <p className="text-red-500 font-medium">{message}</p>
                )}
            </div>
        </div>
    );
}
