
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Poll {
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
  category: string | null;
  tags: string[] | null;
  created_by: string;
}

interface PendingApprovalProps {
  pendingPolls: Poll[];
  onRefresh: () => void;
}

const PendingApproval = ({ pendingPolls, onRefresh }: PendingApprovalProps) => {
  const { toast } = useToast();

  const approvePoll = async (pollId: string) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_active: true })
        .eq('id', pollId);

      if (error) throw error;
      
      toast({ title: "Poll approved and published!" });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error approving poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectPoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to reject this poll? This will delete it permanently.')) return;

    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;
      
      toast({ title: "Poll rejected and deleted" });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error rejecting poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Polls Pending Approval</h2>
        <p className="text-gray-600">Review and approve user-submitted polls</p>
      </div>
      <div className="divide-y">
        {pendingPolls.map((poll) => (
          <div key={poll.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">{poll.title}</h3>
                <p className="text-gray-600 mb-2">{poll.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  Category: {poll.category} • {poll.options.length} options • 
                  Submitted {new Date(poll.created_at).toLocaleDateString()}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Options:</p>
                  {poll.options.map((option, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {option.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  onClick={() => approvePoll(poll.id)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => rejectPoll(poll.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
        {pendingPolls.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No polls pending approval
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApproval;
