import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                'http://localhost:3001/utilisateurs/login',
                { username, password },
                { withCredentials: true } // Include cookies for session management
            );
            Cookies.set('user', JSON.stringify(res.data.user));
            setMessage('Login successful');
            setUsername('');
            setPassword('');
        } catch (err) {
            console.error("Login Error:", err);
            const errorMessage = err.response?.data?.error || 'An unexpected error occurred. Please try again.';
            setMessage(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-96">
                <h1 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-300"
                    >
                        Login
                    </button>
                </form>
                {message && (
                    <p className={`mt-4 text-center font-medium ${message.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
