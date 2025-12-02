import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useGlobalAnnouncement } from '../hooks/useGlobalAnnouncement';

const SLIDE_INTERVAL_MS = 5000; // 5 segundos por linha

const GlobalAnnouncementBanner: React.FC = () => {
  const { announcement, loading } = useGlobalAnnouncement();
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Garante que messages seja um array de strings, mesmo que o DB retorne uma string única (fallback)
  const messages = (announcement?.message && Array.isArray(announcement.message)) 
    ? announcement.message 
    : (typeof announcement?.message === 'string' ? [announcement.message] : []);

  useEffect(() => {
    if (announcement) {
      setIsVisible(true);
      setCurrentMessageIndex(0);
    }
  }, [announcement]);
  
  // Lógica do Carrossel
  useEffect(() => {
    if (messages.length > 1 && isVisible) {
      const timer = setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
      }, SLIDE_INTERVAL_MS);
      return () => clearInterval(timer);
    }
    // Se houver apenas 1 mensagem, garante que o índice seja 0
    if (messages.length === 1) {
        setCurrentMessageIndex(0);
    }
  }, [messages.length, isVisible]);

  if (loading || messages.length === 0 || !isVisible) {
    return null;
  }
  
  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="w-full bg-yellow-500 text-gray-900 p-2 flex items-center justify-center z-[9998] shadow-md flex-shrink-0">
      <Bell size={18} className="mr-2 shrink-0" />
      <p 
        key={currentMessageIndex} // Força a re-renderização e animação (se houver)
        className="text-sm font-semibold text-center flex-1 transition-opacity duration-500 ease-in-out"
        style={{ opacity: 1 }} // Adiciona estilo para transição suave (embora CSS puro seja limitado)
      >
        {currentMessage}
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