import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, LogIn, UserPlus, X, Mail, Hash, ChevronDown } from 'lucide-react';
import { loginUser, registerUser, logoutUser, getUserProfile, UserOut } from '../../api';

export const UserBar: React.FC = () => {
  const [user, setUser] = useState<{ username: string; token: string } | null>(null);
  
  // Modal Visibility States
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [formData, setFormData] = useState({ username: '', password: '', mail: '' });
  const [profileData, setProfileData] = useState<UserOut | null>(null);

  // Refs for click outside
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check local storage on mount
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username, token });
    }
  }, []);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showProfilePopover &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowProfilePopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfilePopover]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearForms = () => {
    setFormData({ username: '', password: '', mail: '' });
    setError(null);
    setShowLogin(false);
    setShowRegister(false);
    setShowProfilePopover(false);
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
      alert('Registration successful! Please login.');
      setShowRegister(false);
      setShowLogin(true);
      setFormData(prev => ({ ...prev, password: '' })); 
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
    setShowProfilePopover(false);
  };

  const toggleProfile = async () => {
      if (showProfilePopover) {
          setShowProfilePopover(false);
          return;
      }

      if (!user?.token) return;
      
      // Load data and show
      setIsLoading(true);
      setShowProfilePopover(true); // Show immediately with loading state
      try {
          const data = await getUserProfile(user.token);
          setProfileData(data);
      } catch (err) {
          console.error("Failed to load profile", err);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <>
      {/* Top Right Bar Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col items-end">
        {user ? (
          <div className="relative">
              {/* User Trigger Button */}
              <button 
                  ref={buttonRef}
                  onClick={toggleProfile}
                  className={`
                    flex items-center gap-3 bg-gray-800/90 backdrop-blur border rounded-full px-4 py-2 shadow-lg transition-all
                    ${showProfilePopover ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}
                  `}
              >
                <div className="bg-blue-600 rounded-full p-1">
                    <User size={14} className="text-white" />
                </div>
                <span className="font-bold text-sm max-w-[100px] truncate text-white">{user.username}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfilePopover ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Popover (Google Style) */}
              {showProfilePopover && (
                  <div 
                    ref={popoverRef}
                    className="absolute top-full right-0 mt-3 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5"
                  >
                      {/* Header Pattern */}
                      <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                      
                      {/* Avatar & Basic Info */}
                      <div className="px-6 relative">
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                              <div className="w-20 h-20 bg-gray-800 rounded-full p-1.5 flex items-center justify-center shadow-md">
                                  <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                      {user.username.charAt(0).toUpperCase()}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="mt-12 text-center pb-6 border-b border-gray-700">
                              <h3 className="text-lg font-bold text-white">{user.username}</h3>
                              <p className="text-sm text-gray-400 truncate">{profileData?.mail || user.username}</p>
                          </div>
                      </div>

                      {/* Details List */}
                      <div className="p-4 space-y-1">
                          {isLoading ? (
                              <div className="text-center py-4 text-gray-500 text-sm">Syncing profile...</div>
                          ) : profileData ? (
                            <>
                              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group cursor-default">
                                  <div className="bg-gray-700 p-2 rounded text-gray-400 group-hover:text-white group-hover:bg-gray-600">
                                      <Hash size={16} />
                                  </div>
                                  <div>
                                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">User ID</p>
                                      <p className="text-sm text-gray-200 font-mono">#{profileData.id}</p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group cursor-default">
                                  <div className="bg-gray-700 p-2 rounded text-gray-400 group-hover:text-white group-hover:bg-gray-600">
                                      <Mail size={16} />
                                  </div>
                                  <div>
                                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Email</p>
                                      <p className="text-sm text-gray-200 truncate max-w-[180px]">{profileData.mail}</p>
                                  </div>
                              </div>
                            </>
                          ) : (
                             <div className="text-center py-4 text-red-400 text-sm">Failed to load details.</div>
                          )}
                      </div>

                      {/* Footer / Actions */}
                      <div className="bg-gray-900/50 p-4 border-t border-gray-700">
                          <button 
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                          >
                              <LogOut size={16} />
                              Sign out
                          </button>
                      </div>
                  </div>
              )}
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

      {/* Login / Register Modals (Centered Overlay) */}
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