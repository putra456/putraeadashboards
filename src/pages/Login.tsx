import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.8s ease-out';
      document.body.style.opacity = '1';
    }, 100);
  }, []);

  useEffect(() => {
    // Check if already authenticated
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
        navigate('/dashboard/home');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center safe-area-inset">
      {/* Animated Background Blobs - Responsive sizes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800" />
        <div className="blob blob-delay-1 absolute -top-20 -left-20 sm:-top-40 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 bg-white/5 rounded-full" />
        <div className="blob blob-delay-2 absolute top-1/4 -right-10 sm:top-1/3 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-white/5 rounded-full" />
        <div className="blob blob-delay-3 absolute -bottom-20 left-1/4 sm:-bottom-40 w-36 h-36 sm:w-72 sm:h-72 bg-neutral-700/20 rounded-full" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Content - Responsive container */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-8 sm:py-12">
        {/* Glass Card - Responsive padding */}
        <div className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl shimmer pointer-events-none overflow-hidden" />
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center glow-pulse overflow-hidden">
                <img 
                  src="https://i.postimg.cc/1ttVt7tr/1778446074299-019e13a4-993a-729a-92a3-3c968743012c-removebg-preview.png" 
                  alt="XauPutra Logo"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
              XauPutra
            </h1>
            <p className="text-white/50 text-sm font-light tracking-wide">
              Welcome back
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 sm:gap-3">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="relative group">
              <label className="block text-xs font-medium text-white/60 mb-2 ml-1 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="liquid-input w-full px-4 py-3.5 rounded-2xl text-white placeholder-white/30 text-[15px] outline-none"
                required
              />
              <div className="absolute right-4 top-[38px] text-white/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label className="block text-xs font-medium text-white/60 mb-2 ml-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="liquid-input w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-white placeholder-white/30 text-sm sm:text-[15px] outline-none pr-12 touch-target"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-[34px] sm:top-[38px] p-1 text-white/30 hover:text-white/60 transition-colors touch-target-sm"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a 
                href="#" 
                className="text-xs text-white/50 hover:text-white/80 transition-colors tracking-wide touch-target-sm inline-flex items-center"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="liquid-button w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-[15px] tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed touch-target"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Get Access - WhatsApp */}
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/10">
              <p className="text-center text-xs text-white/40 mb-3">Need access?</p>
              <a
                href="https://wa.me/6282230304458"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600/80 to-green-500/80 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center gap-2 hover:from-emerald-500/80 hover:to-green-400/80 transition-all duration-300 group touch-target"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-white font-medium text-xs sm:text-sm">Get Access via WhatsApp</span>
                <svg className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </form>
        </div>

        {/* Bottom text */}
        <p className="text-center mt-4 sm:mt-6 text-[10px] sm:text-xs text-white/30 px-4">
          Protected by reCAPTCHA and subject to our<br className="hidden sm:block" />
          <a href="#" className="underline hover:text-white/50 touch-target-sm inline-flex items-center">Privacy Policy</a> and{' '}
          <a href="#" className="underline hover:text-white/50 touch-target-sm inline-flex items-center">Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
