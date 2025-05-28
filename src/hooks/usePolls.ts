
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface DatabasePoll {
  id: string;
  title: string;
  description: string | null;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    color: string;
  }>;
  is_active: boolean;
  created_at: string;
  created_by: string;
  category: string | null;
  tags: string[] | null;
  user_has_voted?: boolean;
}

export const usePolls = () => {
  const [polls, setPolls] = useState<DatabasePoll[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      let pollsWithTypedOptions = data?.map(poll => ({
        ...poll,
        options: Array.isArray(poll.options) ? poll.options as Array<{
          id: string;
          text: string;
          votes: number;
          color: string;
        }> : [],
        category: poll.category || 'General',
        tags: poll.tags || []
      })) || [];

      // If user is logged in, check which polls they've voted on and prioritize unvoted polls
      if (user) {
        const { data: userVotes } = await supabase
          .from('votes')
          .select('poll_id')
          .eq('user_id', user.id);

        const votedPollIds = new Set(userVotes?.map(vote => vote.poll_id) || []);
        
        pollsWithTypedOptions = pollsWithTypedOptions.map(poll => ({
          ...poll,
          user_has_voted: votedPollIds.has(poll.id)
        }));

        // Sort polls: unvoted first, then voted
        pollsWithTypedOptions.sort((a, b) => {
          if (a.user_has_voted === b.user_has_voted) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return a.user_has_voted ? 1 : -1;
        });
      }
      
      setPolls(pollsWithTypedOptions);
    } catch (error: any) {
      console.error('Error fetching polls:', error);
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
  }, [user]);

  return { polls, loading, refetch: fetchPolls };
};
