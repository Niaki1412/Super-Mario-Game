
import React, { useState, useEffect } from 'react';
import { User, LogOut, LogIn, UserPlus, X } from 'lucide-react';
import { loginUser, registerUser, logoutUser } from '../../api';

export const UserBar: React.FC = () => {
  const [user, setUser] = useState<{ username: string; token: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({ username: '', password: '', mail: '' });

  useEffect(() => {
    // Check local storage on mount
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username, token });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearForms = () => {
    setFormData({ username: '', password: '', mail: '' });
    setError(null);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser({ username: formData.username, password: formData.password });
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('username', formData.username);
      setUser({ username: formData.username, token: res.access_token });
      clearForms();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await registerUser({ username: formData.username, password: formData.password, mail: formData.mail });
      // Auto login after register? Or just switch to login
      alert('Registration successful! Please login.');
      setShowRegister(false);
      setShowLogin(true);
      setFormData(prev => ({ ...prev, password: '' })); // Keep username/mail
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (user?.token) {
        try {
            await logoutUser(user.token);
        } catch(e) { console.error(e); }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <>
      {/* Top Right Bar */}
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 bg-gray-800/90 backdrop-blur border border-gray-600 rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <User size={18} />
              <span className="font-bold text-sm max-w-[100px] truncate">{user.username}</span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { clearForms(); setShowLogin(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105"
            >
              <LogIn size={14} />
              Login
            </button>
            <button
              onClick={() => { clearForms(); setShowRegister(true); }}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-gray-500 transition-all hover:scale-105"
            >
              <UserPlus size={14} />
              Register
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showLogin || showRegister) && (
        <div className="fixed inset-0 z-[101] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-fade-in-up">
            <button 
              onClick={clearForms}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {showLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 text-xs p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={showLogin ? handleLogin : handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                {!showLogin && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email</label>
                    <input
                      name="mail"
                      type="email"
                      required
                      value={formData.mail}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded mt-4 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : (showLogin ? 'Login' : 'Sign Up')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  {showLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => { 
                        setError(null); 
                        if(showLogin) { setShowLogin(false); setShowRegister(true); }
                        else { setShowRegister(false); setShowLogin(true); }
                    }}
                    className="text-blue-400 hover:text-blue-300 font-bold underline"
                  >
                    {showLogin ? 'Register' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
