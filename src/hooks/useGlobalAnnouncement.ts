import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { showError } from '../utils/toast';

export interface GlobalAnnouncement {
  id: string;
  message: string | string[]; // Pode ser string ou array de strings
  is_active: boolean;
  created_at: string;
}

export function useGlobalAnnouncement() {
  const [announcement, setAnnouncement] = useState<GlobalAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncement = useCallback(async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('global_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Error fetching global announcement:', error);
      setAnnouncement(null);
    } else if (data) {
      // Garante que a mensagem seja um array de strings, dividindo por quebra de linha se for uma string única
      const messageArray = Array.isArray(data.message) 
        ? data.message 
        : (data.message as string).split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
      setAnnouncement({ ...data, message: messageArray } as GlobalAnnouncement);
    } else {
      setAnnouncement(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  return {
    announcement,
    loading,
    fetchAnnouncement,
  };
}