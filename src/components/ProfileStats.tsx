
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileStatsProps {
  pollsCount: number;
  votesCount: number;
  userRole: string;
}

const ProfileStats = ({ pollsCount, votesCount, userRole }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{pollsCount}</div>
          <div className="text-sm text-gray-600">Polls Created</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{votesCount}</div>
          <div className="text-sm text-gray-600">Votes Cast</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{userRole}</div>
          <div className="text-sm text-gray-600">Account Type</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
