import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

export default function Info() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen px-6 pt-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Information</h1>
      
      <div className="space-y-4">
        <div className="liquid-glass rounded-2xl p-5">
          <h3 className="text-lg font-medium text-white mb-2">About XauPutra</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            XauPutra is a premium trading platform offering advanced Expert Advisors (EA) 
            for MetaTrader 4. Our solutions are designed for both beginner and professional traders.
          </p>
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          <h3 className="text-lg font-medium text-white mb-2">ScalpGridHedge EA</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Our flagship product combines institutional-grade scalping techniques with 
            dynamic grid trading and bi-directional hedging strategies. Optimized for 
            M1 and M5 timeframes on cent accounts.
          </p>
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          <h3 className="text-lg font-medium text-white mb-2">Support</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            For support and inquiries, please contact us via WhatsApp at +62 822-3030-4458
            or email support@xauputra.com
          </p>
        </div>
      </div>
    </div>
  );
}
