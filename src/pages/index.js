import Link from 'next/link';
import styles from '../styles/AuthHome.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
      <div className={styles.logo}></div>
      <h1 className={styles.mainText}>DAUPHINEPLANNER</h1> 
    </header>

      {/* Main Content */}
      <div className={styles.content}>
        <h2 className={styles.title}>WELCOME TO</h2>
        <h1 className={styles.subtitle}>DAUPHINEPLANNER</h1>
        <p className={styles.quote}>
          "Failing to plan is planning to fail, but with DauphinePlanner, we've got your back — chaos, stay out!" 🚀
        </p>
        <Link href="/auth/register">
          <button className={styles.registerButton}>REGISTER</button>
        </Link>
        <p className={styles.loginPrompt}>
          Already have an account? <Link href="/auth/login">Login</Link>
        </p>
        <footer className={styles.footer}>Produced by Dauphinois Students</footer>
      </div>
    </div>
  );
}
