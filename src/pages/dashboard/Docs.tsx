import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

export default function Docs() {
  const [scripts, setScripts] = useState<string[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    const files = await authService.getScriptFiles();
    setScripts(files);
    setConfig(authService.getConfig());
    setIsLoading(false);
  };

  const handleDownload = (fileName: string) => {
    const url = authService.getDownloadUrl(fileName);
    window.open(url, '_blank');
  };

  const filteredScripts = activeCategory === 'All' 
    ? scripts 
    : scripts.filter(s => s.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-5 pt-5 pb-4 sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-white">Downloads</h1>
          <span className="text-[10px] text-white/30 bg-white/5 px-3 py-1 rounded-full">
            {filteredScripts.length} files
          </span>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        {/* Categories */}
        {config?.eaCategories && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
            <button 
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeCategory === 'All' ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/40 border border-white/5'}`}
            >
              ALL
            </button>
            {config.eaCategories.map((cat: string) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-white/40 border border-white/5'}`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Script Downloads */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="animate-spin h-10 w-10 text-white/10 mb-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" /></svg>
              <p className="text-white/20 text-xs">Loading scripts...</p>
            </div>
          ) : filteredScripts.length > 0 ? (
            filteredScripts.map((script, idx) => (
              <div key={script} className="glass-card p-4 flex items-center justify-between group hover-lift" style={{animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both`}}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{script.replace('.mq4', '').replace('.mq5', '')}</p>
                    <p className="text-[10px] text-amber-400/60 uppercase tracking-wider font-medium">.{script.split('.').pop()} Script</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(script)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white hover:text-black hover:border-white transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white/30 text-sm">No scripts available</p>
            </div>
          )}
        </div>

        {/* Installation Guide */}
        <div className="glass-card p-5 mt-6">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Installation Guide
          </h3>
          <div className="space-y-3">
            {['Download MT4 and login to your account', 'Copy EA file to MQL4/Experts folder', 'Restart MT4 and attach EA to chart'].map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</span>
                <p className="text-white/60 text-xs">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
