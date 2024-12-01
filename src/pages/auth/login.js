import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
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