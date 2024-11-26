import Link from 'next/link';

export default function AuthHome() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Auth Module</h1>
        <p className="text-gray-600 text-center mb-6">
          Manage your authentication with ease. Choose an option below:
        </p>
        <div className="space-y-4">
          <Link href="/auth/login" className="block text-center bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition">
            Login
          </Link>
          <Link href="/auth/register" className="block text-center bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition">
            Register
          </Link>
          <Link href="/auth/dashboard" className="block text-center bg-indigo-500 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-600 transition">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
