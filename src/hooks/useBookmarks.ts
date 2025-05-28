
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBookmarks = () => {
  const [bookmarkedPolls, setBookmarkedPolls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('poll_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const bookmarkSet = new Set(data?.map(bookmark => bookmark.poll_id) || []);
      setBookmarkedPolls(bookmarkSet);
    } catch (error: any) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (pollId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark polls",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      const isBookmarked = bookmarkedPolls.has(pollId);

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setBookmarkedPolls(prev => {
          const newSet = new Set(prev);
          newSet.delete(pollId);
          return newSet;
        });

        toast({
          title: "Bookmark removed",
          description: "Poll removed from bookmarks",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            poll_id: pollId,
            user_id: user.id,
          });

        if (error) throw error;
        
        setBookmarkedPolls(prev => new Set([...prev, pollId]));

        toast({
          title: "Poll bookmarked",
          description: "Poll added to your bookmarks",
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  return {
    bookmarkedPolls,
    toggleBookmark,
    loading,
    refetch: fetchBookmarks
  };
};
