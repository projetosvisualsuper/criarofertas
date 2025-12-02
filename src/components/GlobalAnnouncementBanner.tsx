import React from 'react';
import { Bell, X } from 'lucide-react';
import { useGlobalAnnouncement } from '../hooks/useGlobalAnnouncement';

const GlobalAnnouncementBanner: React.FC = () => {
  const { announcement, loading } = useGlobalAnnouncement();
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    // Reset visibility when a new announcement loads
    if (announcement) {
      setIsVisible(true);
    }
  }, [announcement]);

  if (loading || !announcement || !announcement.is_active || !isVisible) {
    return null;
  }

  return (
    <div className="w-full bg-yellow-500 text-gray-900 p-2 flex items-center justify-center z-[9998] shadow-md flex-shrink-0">
      <Bell size={18} className="mr-2 shrink-0" />
      <p className="text-sm font-semibold truncate flex-1 text-center">
        {announcement.message}
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 p-1 rounded-full hover:bg-yellow-600 transition-colors shrink-0"
        title="Fechar Anúncio"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default GlobalAnnouncementBanner;