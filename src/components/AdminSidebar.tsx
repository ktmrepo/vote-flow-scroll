
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Settings, 
  Upload, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  analytics: {
    totalPolls: number;
    totalVotes: number;
    activePolls: number;
    totalUsers: number;
    pendingPolls: number;
  };
}

const AdminSidebar = ({ activeTab, onTabChange, analytics }: AdminSidebarProps) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'polls',
      label: 'Manage Polls',
      icon: FileText,
      badge: analytics.totalPolls
    },
    {
      id: 'pending',
      label: 'Pending Approval',
      icon: Clock,
      badge: analytics.pendingPolls
    },
    {
      id: 'bulk-upload',
      label: 'Bulk Upload',
      icon: Upload,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      badge: analytics.totalUsers
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your polling system</p>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Active</span>
            </div>
            <div className="text-lg font-semibold text-blue-600">{analytics.activePolls}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-orange-600" />
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="text-lg font-semibold text-orange-600">{analytics.pendingPolls}</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-10 ${
                  isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== null && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
