
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Eye, Clock } from 'lucide-react';

interface AdminOverviewProps {
  analytics: {
    totalPolls: number;
    totalVotes: number;
    activePolls: number;
    totalUsers: number;
    pendingPolls: number;
  };
}

const AdminOverview = ({ analytics }: AdminOverviewProps) => {
  const statsCards = [
    {
      title: 'Total Polls',
      value: analytics.totalPolls,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Polls',
      value: analytics.activePolls,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Approval',
      value: analytics.pendingPolls,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Votes',
      value: analytics.totalVotes,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const performanceMetrics = [
    {
      label: 'Average votes per poll',
      value: analytics.totalPolls > 0 ? Math.round(analytics.totalVotes / analytics.totalPolls) : 0
    },
    {
      label: 'Active poll ratio',
      value: analytics.totalPolls > 0 ? Math.round((analytics.activePolls / analytics.totalPolls) * 100) : 0,
      suffix: '%'
    },
    {
      label: 'Average votes per user',
      value: analytics.totalUsers > 0 ? Math.round(analytics.totalVotes / analytics.totalUsers) : 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value}{metric.suffix || ''}
                </div>
                <div className="text-sm text-gray-600 mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <h3 className="font-medium text-gray-900">Bulk Upload</h3>
              <p className="text-sm text-gray-600 mt-1">Upload multiple polls or users</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600 mt-1">Download poll results</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <h3 className="font-medium text-gray-900">User Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">View user engagement</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <h3 className="font-medium text-gray-900">System Health</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor system status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
