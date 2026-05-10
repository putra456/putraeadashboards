import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Home from './pages/dashboard/Home';
import Info from './pages/dashboard/Info';
import History from './pages/dashboard/History';
import Docs from './pages/dashboard/Docs';
import Profile from './pages/dashboard/Profile';
import AdminPanel from './pages/admin/AdminPanel';
import { authService } from './services/auth';

function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800" />
        <div className="blob blob-delay-1 absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full" />
        <div className="blob blob-delay-2 absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full" />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-8 glow-pulse overflow-hidden">
          <img 
            src="https://i.postimg.cc/1ttVt7tr/1778446074299-019e13a4-993a-729a-92a3-3c968743012c-removebg-preview.png" 
            alt="XauPutra Logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-white/60 to-white/30 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-white/50 text-sm tracking-wide">
          {progress >= 100 ? 'Ready' : 'Loading...'}
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload users from database
    const loadData = async () => {
      await authService.fetchUsersFromGitHub();
      await authService.fetchConfig();
      
      // Minimum loading time for smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    loadData();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<MainLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="info" element={<Info />} />
          <Route path="history" element={<History />} />
          <Route path="docs" element={<Docs />} />
          <Route path="profile" element={<Profile />} />
          <Route index element={<Home />} />
        </Route>
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
