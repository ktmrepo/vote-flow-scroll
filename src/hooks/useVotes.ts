
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useVotes = (pollId?: string) => {
  const [userVote, setUserVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserVote = async () => {
    if (!user || !pollId) return;

    try {
      const { data, error } = await supabase
        .from('votes' as any)
        .select('option_id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserVote(data?.option_id || null);
    } catch (error: any) {
      console.error('Error fetching user vote:', error);
    }
  };

  const fetchVotes = async () => {
    if (!pollId) return;

    try {
      const { data, error } = await supabase
        .from('votes' as any)
        .select('option_id')
        .eq('poll_id', pollId);

      if (error) throw error;
      
      const voteCounts: Record<string, number> = {};
      data?.forEach((vote: any) => {
        voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
      });
      
      setVotes(voteCounts);
    } catch (error: any) {
      console.error('Error fetching votes:', error);
    }
  };

  const castVote = async (optionId: string): Promise<boolean> => {
    if (!user || !pollId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      if (userVote) {
        // Update existing vote
        const { error } = await supabase
          .from('votes' as any)
          .update({ option_id: optionId })
          .eq('poll_id', pollId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('votes' as any)
          .insert({
            poll_id: pollId,
            user_id: user.id,
            option_id: optionId,
          });

        if (error) throw error;
      }

      setUserVote(optionId);
      await fetchVotes();
      
      toast({
        title: "Vote recorded!",
        description: "Your vote has been successfully recorded.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error casting vote",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pollId) {
      fetchUserVote();
      fetchVotes();
    }
  }, [pollId, user]);

  return {
    userVote,
    votes,
    loading,
    castVote,
    refetch: () => {
      fetchUserVote();
      fetchVotes();
    }
  };
};
