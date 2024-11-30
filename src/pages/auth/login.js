import { useState } from 'react';
import axios from 'axios';
<<<<<<< HEAD
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                'http://localhost:3001/utilisateurs/login',
                { email, password },
                { withCredentials: true }
            );
            Cookies.set('user', JSON.stringify(res.data.user));
            router.push('dashboard');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Erreur de connexion');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-96">
                <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Microsoft ToDo</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300"
                    >
                        Se connecter
                    </button>
                </form>
                {message && (
                    <p className="mt-4 text-center text-red-500 font-medium">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
=======
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        'http://localhost:3001/utilisateurs/login',
        { email, password },
        { withCredentials: true } // Include cookies for session handling
      );
      setMessage('Login successful. Redirecting...');
      setTimeout(() => {
        router.push('/auth/dashboard'); // Redirect to the dashboard
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred.');
    }
  };

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}></div>
        <h1 className={styles.mainText}>DAUPHINEPLANNER</h1>
        <Link href="/" className={styles.homeLink}>
          HomePage
          <span className={styles.arrowIcon}></span>
        </Link>
      </header>
      {/* Page Content */}
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Left Section */}
          <div className={styles.leftSection}>
            <p className={styles.footerText}>Produced by Dauphinois Students</p>
          </div>

          {/* Right Section */}
          <div className={styles.rightSection}>
            <h1 className={styles.title}>LOGIN</h1>
            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  placeholder="E-Mail"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                LOGIN
              </button>
            </form>
            {message && (
              <p
                className={`${styles.message} ${
                  message.includes('successful') ? styles.success : styles.error
                }`}
              >
                {message}
              </p>
            )}
            <p className={styles.signUpPrompt}>
              Don’t have an Account? <Link href="/auth/register">SignUp</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
>>>>>>> 50f777f (update project)
