
import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, LogIn, UserPlus, X, Mail, Hash, ChevronDown, ShieldCheck, BadgeCheck } from 'lucide-react';
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
    
    if (token) {
      if (username) {
        setUser({ username, token });
      }
      
      // Fetch latest profile data immediately
      getUserProfile(token)
        .then(data => {
          setProfileData(data);
          // Update username in case it changed on backend
          setUser({ username: data.username, token });
          localStorage.setItem('username', data.username);
        })
        .catch(err => {
          console.error("Failed to fetch initial profile", err);
          // Optional: handle token expiration here by logging out
        });
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
      
      // Fetch profile after login to populate roles etc.
      try {
          const profile = await getUserProfile(res.access_token);
          setProfileData(profile);
      } catch (err) {
          console.error("Failed to fetch profile after login");
      }

      window.dispatchEvent(new Event('auth-change'));
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
    setProfileData(null);
    setShowProfilePopover(false);
    window.dispatchEvent(new Event('auth-change'));
  };

  const toggleProfile = async () => {
      if (showProfilePopover) {
          setShowProfilePopover(false);
          return;
      }

      if (!user?.token) return;
      
      // If we don't have profile data yet, fetch it
      if (!profileData) {
          setIsLoading(true);
          try {
              const data = await getUserProfile(user.token);
              setProfileData(data);
          } catch (err) {
              console.error("Failed to load profile", err);
          } finally {
              setIsLoading(false);
          }
      }
      
      setShowProfilePopover(true); 
  };

  const getRoleLabel = (role: number) => {
      switch (role) {
          case 2: return "Super Admin";
          case 1: return "Auditor";
          default: return "User";
      }
  };

  const getRoleColor = (role: number) => {
      switch (role) {
          case 2: return "text-purple-400 bg-purple-500/20 border-purple-500/30";
          case 1: return "text-blue-400 bg-blue-500/20 border-blue-500/30";
          default: return "text-gray-400 bg-gray-500/20 border-gray-500/30";
      }
  };

  return (
    <>
      <style>{`
        @keyframes popover-in {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popover {
          animation: popover-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Top Right Bar Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col items-end font-sans">
        {user ? (
          <div className="relative">
              {/* User Trigger Button */}
              <button 
                  ref={buttonRef}
                  onClick={toggleProfile}
                  className={`
                    flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full shadow-lg transition-all border
                    ${showProfilePopover 
                        ? 'bg-gray-800 border-gray-600 ring-2 ring-blue-500/50' 
                        : 'bg-gray-800/90 backdrop-blur border-gray-700 hover:bg-gray-700 hover:border-gray-500'}
                  `}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-sm max-w-[100px] truncate text-gray-200">{user.username}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showProfilePopover ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Popover (Google Style) */}
              {showProfilePopover && (
                  <div 
                    ref={popoverRef}
                    className="absolute top-full right-0 mt-3 w-80 bg-[#202124] border border-gray-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-popover origin-top-right z-50"
                  >
                      {/* Profile Info Section */}
                      <div className="p-4 flex flex-col items-center border-b border-gray-700/50">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg relative group cursor-default">
                              {user.username.charAt(0).toUpperCase()}
                              <div className="absolute inset-0 rounded-full ring-2 ring-white/10 group-hover:ring-white/30 transition-all"></div>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                          <p className="text-sm text-gray-400 mb-4">{profileData?.mail || user.username}</p>
                          
                          <button 
                            className="text-blue-400 text-xs border border-gray-600 hover:bg-blue-500/10 px-4 py-1.5 rounded-full transition-colors font-medium"
                            onClick={() => alert("Manage Account feature coming soon!")}
                          >
                            Manage your Mario Account
                          </button>
                      </div>

                      {/* Stats / Info Grid */}
                      <div className="p-2">
                          {isLoading ? (
                              <div className="py-6 flex justify-center">
                                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                          ) : profileData ? (
                            <div className="bg-[#303134] rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/10 p-1.5 rounded-full text-gray-300">
                                            <BadgeCheck size={14} />
                                        </div>
                                        <span className="text-sm text-gray-300">Role</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleColor(profileData.role)}`}>
                                        {getRoleLabel(profileData.role)}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/10 p-1.5 rounded-full text-gray-300">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <span className="text-sm text-gray-300">Status</span>
                                    </div>
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">Active</span>
                                </div>
                            </div>
                          ) : (
                             <div className="text-center py-4 text-red-400 text-xs">Failed to sync profile data.</div>
                          )}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-2 border-t border-gray-700/50">
                          <button 
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center gap-2 hover:bg-[#303134] text-gray-300 hover:text-white p-3 rounded-lg transition-colors text-sm font-medium"
                          >
                              <LogOut size={18} />
                              Sign out
                          </button>
                      </div>
                      
                      {/* Footer Links (Decorative) */}
                      <div className="px-4 py-2 bg-[#171717] flex justify-center gap-4 text-[10px] text-gray-500">
                          <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
                          <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
                      </div>
                  </div>
              )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { clearForms(); setShowLogin(true); }}
              className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-bold px-3 py-2 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => { clearForms(); setShowRegister(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2 rounded-md shadow-md transition-all hover:shadow-blue-500/30"
            >
              Sign up
            </button>
          </div>
        )}
      </div>

      {/* Login / Register Modals (Standard Overlay) */}
      {(showLogin || showRegister) && (
        <div className="fixed inset-0 z-[101] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#202124] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={clearForms}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-8">
              <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 mb-4">
                      {showLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {showLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                      {showLogin ? 'Enter your credentials to access your maps.' : 'Join us to build and share your worlds.'}
                  </p>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
                    <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                    {error}
                </div>
              )}

              <form onSubmit={showLogin ? handleLogin : handleRegister} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-[#303134] border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Enter username"
                  />
                </div>
                
                {!showLogin && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                    <input
                      name="mail"
                      type="email"
                      required
                      value={formData.mail}
                      onChange={handleInputChange}
                      className="w-full bg-[#303134] border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-[#303134] border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-2 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {isLoading ? 'Processing...' : (showLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className="mt-6 text-center pt-6 border-t border-gray-700/50">
                <p className="text-sm text-gray-400">
                  {showLogin ? "New here? " : "Already have an account? "}
                  <button 
                    onClick={() => { 
                        setError(null); 
                        if(showLogin) { setShowLogin(false); setShowRegister(true); }
                        else { setShowRegister(false); setShowLogin(true); }
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                  >
                    {showLogin ? 'Create an account' : 'Log in'}
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
