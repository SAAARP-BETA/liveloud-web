'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Home</h1>
          {user && (
            <div className="mb-4">
              <p className="text-gray-600">Hello, <span className="font-semibold">{user.username}</span>!</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
