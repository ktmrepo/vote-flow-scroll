import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Eye, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      const { data: polls, error } = await supabase
        .from('polls')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      // Count polls by category
      const categoryCount: Record<string, number> = {};
      polls?.forEach(poll => {
        const category = poll.category || 'General';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      setCategoryStats(categoryCount);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Category Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Polls by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading category statistics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryStats)
                .sort(([,a], [,b]) => b - a) // Sort by count descending
                .map(([category, count]) => (
                <div key={category} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{category}</h3>
                    <span className="text-2xl font-bold text-blue-600">{count}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {((count / analytics.activePolls) * 100).toFixed(1)}% of active polls
                  </p>
                </div>
              ))}
              {Object.keys(categoryStats).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          )}
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