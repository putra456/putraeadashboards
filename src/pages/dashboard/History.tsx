import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

export default function History() {
  const [config, setConfig] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    setConfig(authService.getConfig());
  }, [navigate]);

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 pt-4 sm:pt-6 pb-24 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Changelog & History</h1>
      
      <div className="space-y-4">
        {config?.history && config.history.length > 0 ? (
          config.history.map((item: any) => (
            <div key={item.id} className="liquid-glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.type === 'New Release' ? 'bg-emerald-500 text-black' : 
                    item.type === 'Fix' ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-white font-bold">{item.version}</span>
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest">{item.date}</span>
              </div>
              
              <p className="text-white/60 text-xs sm:text-sm whitespace-pre-line mb-4">
                {item.changelog}
              </p>

              {item.fileUrl && (
                <button 
                  onClick={() => handleDownload(item.fileUrl)}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-xs font-medium text-white/80"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" />
                  </svg>
                  Download this version
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-white/40 text-sm italic">No history logged yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
