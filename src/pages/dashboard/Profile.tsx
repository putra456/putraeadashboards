import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }

    const user = authService.getCurrentUser();
    if (user) {
      setUsername(user.username);
      setRole(user.role);
      setIsAdmin(user.username === 'admin');
    }
  }, [navigate]);

  const handleProfileClick = () => {
    if (!isAdmin) return;
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 2) {
      // Double click detected for admin
      navigate('/admin');
      setClickCount(0);
    }
    
    // Reset click count after 500ms
    setTimeout(() => {
      setClickCount(0);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 pt-4 sm:pt-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Profile</h1>
      
      {/* Profile Card */}
      <div className="liquid-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col items-center">
          {/* Profile Picture - Double click for admin panel */}
          <button
            onClick={handleProfileClick}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 ${
              isAdmin ? 'border-amber-400/50 cursor-pointer hover:border-amber-400' : 'border-white/20'
            } flex items-center justify-center mb-3 sm:mb-4 transition-all overflow-hidden ${
              isAdmin ? 'active:scale-95' : ''
            } touch-target`}
          >
            <img 
              src="https://i.postimg.cc/1ttVt7tr/1778446074299-019e13a4-993a-729a-92a3-3c968743012c-removebg-preview.png" 
              alt="Profile"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
            {isAdmin && (
              <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-amber-400 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            )}
          </button>
          
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">{username}</h2>
          <p className="text-white/50 text-xs sm:text-sm capitalize mb-3 sm:mb-4">{role}</p>
          
          {isAdmin && (
            <p className="text-amber-400/70 text-[10px] sm:text-xs text-center">
              Double-tap profile picture to access Admin Panel
            </p>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="liquid-glass rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Account Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Username</span>
            <span className="text-white text-sm font-medium">{username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Role</span>
            <span className="text-white text-sm font-medium capitalize">{role}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Status</span>
            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="liquid-glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Settings</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <span className="text-white text-sm">Change Password</span>
            <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <span className="text-white text-sm">Notifications</span>
            <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
