import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

export default function Home() {
  const [username, setUsername] = useState('User');
  const [isPremium, setIsPremium] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    setUsername(authService.getUsername());
    setIsPremium(authService.isPremium());
    setConfig(authService.getConfig());
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-5 pt-5 pb-4 sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden glow">
              <img src={config?.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">{config?.brandName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-dot online"></span>
                  {authService.getRole()}
                </span>
                {isPremium && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold">
                    PREMIUM
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        {/* Welcome Card */}
        <div className="glass-card p-5 mb-6 hover-lift glow-amber">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0 border border-amber-500/20">
              <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-1">{config?.homeTitle}, {username}</h2>
              <p className="text-amber-400 text-sm font-medium mb-2">{config?.homeSubTitle}</p>
              <p className="text-white/50 text-xs leading-relaxed">{config?.homeDescription}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a href={`https://wa.me/${config?.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="glass-card p-4 flex flex-col items-center gap-2 hover-lift active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </div>
            <span className="text-white text-xs font-medium">Support</span>
          </a>
          <button onClick={() => navigate('/dashboard/docs')} className="glass-card p-4 flex flex-col items-center gap-2 hover-lift active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            </div>
            <span className="text-white text-xs font-medium">Downloads</span>
          </button>
        </div>

        {/* Latest News Section */}
        {config?.news && config.news.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Latest News
              </h3>
              <span className="text-[10px] text-white/30">{config.news.length} updates</span>
            </div>
            <div className="space-y-3">
              {config.news.slice(0, 3).map((item: any, idx: number) => (
                <div key={item.id} className="glass-card p-4 border-l-2 border-l-amber-500/50 hover-lift" style={{animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`}}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                    <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{item.date}</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!config?.news?.length && (
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">No announcements yet</p>
            <p className="text-white/20 text-xs mt-1">Check back later for updates</p>
          </div>
        )}
      </main>
    </div>
  );
}
