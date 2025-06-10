
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import AdminOverview from '@/components/AdminOverview';
import BulkUpload from '@/components/BulkUpload';
import PollManagement from '@/components/PollManagement';
import PendingApproval from '@/components/PendingApproval';

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

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pendingPolls, setPendingPolls] = useState<Poll[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [analytics, setAnalytics] = useState({
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    totalUsers: 0,
    pendingPolls: 0
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    options: ['', '', '', '']
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPolls();
      fetchPendingPolls();
      fetchAnalytics();
    }
  }, [user, isAdmin]);

  // Close sidebar on mobile when tab changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeTab, isMobile]);

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const pollsWithTypedOptions = data?.map(poll => ({
        ...poll,
        options: Array.isArray(poll.options) ? poll.options as Array<{
          id: string;
          text: string;
          votes: number;
          color: string;
        }> : [],
        category: poll.category || 'General',
        tags: poll.tags || []
      })) || [];
      
      setPolls(pollsWithTypedOptions);
    } catch (error: any) {
      toast({
        title: "Error fetching polls",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPendingPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const pollsWithTypedOptions = data?.map(poll => ({
        ...poll,
        options: Array.isArray(poll.options) ? poll.options as Array<{
          id: string;
          text: string;
          votes: number;
          color: string;
        }> : [],
        category: poll.category || 'General',
        tags: poll.tags || []
      })) || [];
      
      setPendingPolls(pollsWithTypedOptions);
    } catch (error: any) {
      console.error('Error fetching pending polls:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch total polls
      const { count: pollCount } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true });

      // Fetch active polls
      const { count: activePollCount } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch pending polls
      const { count: pendingPollCount } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false);

      // Fetch total votes
      const { count: voteCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });

      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setAnalytics({
        totalPolls: pollCount || 0,
        totalVotes: voteCount || 0,
        activePolls: activePollCount || 0,
        totalUsers: userCount || 0,
        pendingPolls: pendingPollCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    }
  };

  const refreshData = () => {
    fetchPolls();
    fetchPendingPolls();
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview analytics={analytics} />;
      case 'polls':
        return (
          <PollManagement
            polls={polls}
            showCreateForm={showCreateForm}
            setShowCreateForm={setShowCreateForm}
            editingPoll={editingPoll}
            setEditingPoll={setEditingPoll}
            formData={formData}
            setFormData={setFormData}
            onRefresh={refreshData}
            user={user}
          />
        );
      case 'pending':
        return (
          <PendingApproval
            pendingPolls={pendingPolls}
            onRefresh={refreshData}
          />
        );
      case 'bulk-upload':
        return <BulkUpload />;
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Detailed Analytics</h2>
            <p className="text-gray-600">Advanced analytics features coming soon...</p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">User management features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <p className="text-gray-600">System settings coming soon...</p>
          </div>
        );
      default:
        return <AdminOverview analytics={analytics} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showCreateForm={showCreateForm}
        setShowCreateForm={setShowCreateForm}
        setEditingPoll={setEditingPoll}
        setFormData={setFormData}
      />
      
      <div className="flex flex-1 relative">
        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed' : 'relative'} 
          inset-y-0 left-0 z-50 
          ${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
          ${isMobile ? 'top-[57px]' : ''}
        `}>
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            analytics={analytics}
          />
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
