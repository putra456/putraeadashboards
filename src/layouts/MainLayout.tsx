import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }

    // Set active tab based on location
    const path = location.pathname;
    if (path.includes('/home')) setActiveTab('home');
    else if (path.includes('/info')) setActiveTab('info');
    else if (path.includes('/history')) setActiveTab('history');
    else if (path.includes('/docs')) setActiveTab('docs');
    else if (path.includes('/profile')) setActiveTab('profile');
  }, [location, navigate]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    navigate(`/dashboard/${tab}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800" />
        <div className="blob blob-delay-1 absolute -top-40 -right-40 w-80 h-80 bg-white/3 rounded-full" />
        <div className="blob blob-delay-2 absolute top-1/2 -left-40 w-96 h-96 bg-neutral-800/30 rounded-full" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto scroll-container pb-24">
          <Outlet />
        </div>
      </div>

      {/* Bottom Navigation Bar - Responsive */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset">
        <div className="mx-2 sm:mx-4 mb-2 sm:mb-4">
          <div className="liquid-glass rounded-2xl sm:rounded-3xl px-1 sm:px-2 py-1.5 sm:py-2">
            <div className="flex items-center justify-around">
              {/* Home */}
              <button 
                onClick={() => handleTabClick('home')}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 touch-target ${
                  activeTab === 'home' 
                    ? 'bg-white/10' 
                    : 'hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'home' ? 'text-white' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className={`text-[9px] sm:text-[10px] ${activeTab === 'home' ? 'text-white font-medium' : 'text-white/40'}`}>Home</span>
              </button>

              {/* Info */}
              <button 
                onClick={() => handleTabClick('info')}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 touch-target ${
                  activeTab === 'info' 
                    ? 'bg-white/10' 
                    : 'hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'info' ? 'text-white' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span className={`text-[9px] sm:text-[10px] ${activeTab === 'info' ? 'text-white font-medium' : 'text-white/40'}`}>Info</span>
              </button>

              {/* History */}
              <button 
                onClick={() => handleTabClick('history')}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 touch-target ${
                  activeTab === 'history' 
                    ? 'bg-white/10' 
                    : 'hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'history' ? 'text-white' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-[9px] sm:text-[10px] ${activeTab === 'history' ? 'text-white font-medium' : 'text-white/40'}`}>History</span>
              </button>

              {/* Docs */}
              <button 
                onClick={() => handleTabClick('docs')}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 touch-target ${
                  activeTab === 'docs' 
                    ? 'bg-white/10' 
                    : 'hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'docs' ? 'text-white' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className={`text-[9px] sm:text-[10px] ${activeTab === 'docs' ? 'text-white font-medium' : 'text-white/40'}`}>Docs</span>
              </button>

              {/* Profile */}
              <button 
                onClick={() => handleTabClick('profile')}
                className={`flex flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 touch-target ${
                  activeTab === 'profile' 
                    ? 'bg-white/10' 
                    : 'hover:bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'profile' ? 'text-white' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className={`text-[9px] sm:text-[10px] ${activeTab === 'profile' ? 'text-white font-medium' : 'text-white/40'}`}>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
