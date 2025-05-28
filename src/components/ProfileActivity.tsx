
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PollItem {
  id: string;
  title: string;
  created_at: string;
  category: string | null;
}

interface VoteItem {
  id: string;
  created_at: string;
  poll?: {
    title: string;
  };
}

interface ProfileActivityProps {
  polls: PollItem[];
  votes: VoteItem[];
}

const ProfileActivity = ({ polls, votes }: ProfileActivityProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Polls</CardTitle>
        </CardHeader>
        <CardContent>
          {polls.length > 0 ? (
            <div className="space-y-3">
              {polls.slice(0, 5).map((poll) => (
                <div key={poll.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">{poll.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {poll.category} • {new Date(poll.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No polls created yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Votes</CardTitle>
        </CardHeader>
        <CardContent>
          {votes.length > 0 ? (
            <div className="space-y-3">
              {votes.slice(0, 5).map((vote) => (
                <div key={vote.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">{vote.poll?.title || "Unknown Poll"}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Voted on {new Date(vote.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No votes cast yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileActivity;
