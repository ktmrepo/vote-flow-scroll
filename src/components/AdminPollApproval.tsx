
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PendingPoll {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  created_at: string;
  created_by: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    color: string;
  }>;
}

const AdminPollApproval = () => {
  const [pendingPolls, setPendingPolls] = useState<PendingPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingPolls();
  }, []);

  const fetchPendingPolls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedPolls = data?.map(poll => ({
        ...poll,
        options: Array.isArray(poll.options) ? poll.options as Array<{
          id: string;
          text: string;
          votes: number;
          color: string;
        }> : []
      })) || [];

      setPendingPolls(typedPolls);
    } catch (error: any) {
      console.error('Error fetching pending polls:', error);
      toast({
        title: "Error fetching pending polls",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approvePoll = async (pollId: string) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_active: true })
        .eq('id', pollId);

      if (error) throw error;

      toast({
        title: "Poll approved",
        description: "The poll has been approved and is now active.",
      });

      fetchPendingPolls();
    } catch (error: any) {
      console.error('Error approving poll:', error);
      toast({
        title: "Error approving poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectPoll = async (pollId: string) => {
    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;

      toast({
        title: "Poll rejected",
        description: "The poll has been rejected and deleted.",
      });

      fetchPendingPolls();
    } catch (error: any) {
      console.error('Error rejecting poll:', error);
      toast({
        title: "Error rejecting poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending Polls
        </h3>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Pending Polls ({pendingPolls.length})
      </h3>
      
      {pendingPolls.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No pending polls to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingPolls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <CardTitle className="text-base">{poll.title}</CardTitle>
                <CardDescription>
                  {poll.description && <span>{poll.description}<br /></span>}
                  Category: {poll.category} • Created: {new Date(poll.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-medium text-gray-700">Poll Options:</p>
                  <div className="space-y-2">
                    {poll.options.map((option) => (
                      <div key={option.id} className="p-2 bg-gray-50 rounded text-sm">
                        {option.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => approvePoll(poll.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => rejectPoll(poll.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPollApproval;
