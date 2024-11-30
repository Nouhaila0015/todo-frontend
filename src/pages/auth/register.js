import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router'; // Import useRouter
import styles from '../../styles/RegisterForm.module.css';
import Link from 'next/link';


export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter(); // Initialize useRouter

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:3001/utilisateurs/register', {
        email,
        username,
        password,
      });

      setMessage('Registration successful. Redirecting to login...');
      setEmail('');
      setUsername('');
      setPassword('');

      // Redirect to the login page
      setTimeout(() => {
        router.push('/auth/login'); // Redirect after a short delay
      }, 1000); // 2-second delay for user feedback
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred.');
    }
  };

  return (
    <>
    {/* Header */}
    <header className={styles.header}>
      <Link href="/" className={styles.homeLink}>
        HomePage
        <span className={styles.arrowIcon}></span>
      </Link>
    </header>
    <div className={styles.container}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        
        <div>
          {/* Header Section */}
      <header className={styles.header}>
      <div className={styles.logo}></div>
      <h1 className={styles.mainesText}>DAUPHINEPLANNER</h1> 
    </header>
          <p className={styles.mainText}>
            Let’s Start this journey Together <br /> <span>-With Us-</span>
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <h1 className={styles.title}>Sign Up</h1>
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
            />
          </div>
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
          <div className={styles.checkboxGroup}>
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the statement in <a href="#">Terms & Conditions</a>
            </label>
          </div>
          <button type="submit" className={styles.submitButton}>Sign Up</button>
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
        <p className={styles.signInPrompt}>
          Already have an account? <a href="/auth/login">Login</a>
        </p>
      </div>
    </div>
    </>
  );
}
