import React, { useState } from 'react';
import { Icon } from './common/Icon';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user: User;
      if (isLogin) {
        user = await api.login({ email, password });
      } else {
        user = await api.register({ email, password });
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                <Icon name="chef-hat" className="w-9 h-9 text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-bold text-gray-800">Pantry Pal</h1>
                <p className="text-lg text-gray-500 -mt-1">Your AI-Powered Kitchen Assistant</p>
            </div>
        </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
        <p className="text-center text-gray-500 mb-6">{isLogin ? 'Sign in to access your pantry.' : 'Get started by creating a free account.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 transition-colors"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-medium text-emerald-600 hover:text-emerald-500">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
       <footer className="text-center py-6 mt-12 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Pantry Pal. Cook something amazing!</p>
      </footer>
    </div>
  );
};