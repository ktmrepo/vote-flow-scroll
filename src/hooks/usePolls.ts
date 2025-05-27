
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DatabasePoll {
  id: string;
  title: string;
  description: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    color: string;
  }>;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export const usePolls = () => {
  const [polls, setPolls] = useState<DatabasePoll[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching polls",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return { polls, loading, refetch: fetchPolls };
};
