
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, X, Plus } from 'lucide-react';

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  setEditingPoll: (poll: any) => void;
  setFormData: (data: any) => void;
}

const AdminHeader = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  showCreateForm, 
  setShowCreateForm,
  setEditingPoll,
  setFormData
}: AdminHeaderProps) => {
  const navigate = useNavigate();

  const handleCreatePoll = () => {
    setShowCreateForm(!showCreateForm);
    setEditingPoll(null);
    setFormData({ title: '', description: '', category: 'General', options: ['', '', '', ''] });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage polls, users, and system settings</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Polls
          </Button>
          <Button
            onClick={handleCreatePoll}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Poll
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
