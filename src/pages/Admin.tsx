import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart3, Users, TrendingUp, Check, X, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkUpload from '@/components/BulkUpload';

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

  const approvePoll = async (pollId: string) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_active: true })
        .eq('id', pollId);

      if (error) throw error;
      
      toast({ title: "Poll approved and published!" });
      fetchPolls();
      fetchPendingPolls();
      fetchAnalytics();
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
      fetchPolls();
      fetchPendingPolls();
      fetchAnalytics();
    } catch (error: any) {
      toast({
        title: "Error rejecting poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const options = formData.options
      .filter(opt => opt.trim())
      .map((text, index) => ({
        id: text.toLowerCase().replace(/\s+/g, '_'),
        text: text.trim(),
        votes: 0,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index] || '#6b7280'
      }));

    if (options.length < 2) {
      toast({
        title: "Invalid options",
        description: "Please provide at least 2 options",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPoll) {
        const { error } = await supabase
          .from('polls')
          .update({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            options: options,
          })
          .eq('id', editingPoll.id);

        if (error) throw error;
        toast({ title: "Poll updated successfully!" });
      } else {
        const { error } = await supabase
          .from('polls')
          .insert({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            options: options,
            created_by: user!.id,
            is_active: true, // Admin-created polls are active by default
          });

        if (error) throw error;
        toast({ title: "Poll created successfully!" });
      }

      setFormData({ title: '', description: '', category: 'General', options: ['', '', '', ''] });
      setShowCreateForm(false);
      setEditingPoll(null);
      fetchPolls();
      fetchPendingPolls();
      fetchAnalytics();
    } catch (error: any) {
      toast({
        title: "Error saving poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePollStatus = async (poll: Poll) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_active: !poll.is_active })
        .eq('id', poll.id);

      if (error) throw error;
      
      toast({
        title: `Poll ${!poll.is_active ? 'activated' : 'deactivated'}`,
      });
      fetchPolls();
      fetchPendingPolls();
      fetchAnalytics();
    } catch (error: any) {
      toast({
        title: "Error updating poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;

    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;
      
      toast({ title: "Poll deleted successfully" });
      fetchPolls();
      fetchPendingPolls();
      fetchAnalytics();
    } catch (error: any) {
      toast({
        title: "Error deleting poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (poll: Poll) => {
    setEditingPoll(poll);
    setFormData({
      title: poll.title,
      description: poll.description || '',
      category: poll.category || 'General',
      options: poll.options.map(opt => opt.text).concat(Array(4 - poll.options.length).fill(''))
    });
    setShowCreateForm(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Polls
            </Button>
            <Button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setEditingPoll(null);
                setFormData({ title: '', description: '', category: 'General', options: ['', '', '', ''] });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="polls">Manage Polls</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval ({analytics.pendingPolls})
            </TabsTrigger>
            <TabsTrigger value="bulk-upload">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalPolls}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.activePolls}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <X className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.pendingPolls}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalVotes}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending">
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
          </TabsContent>

          <TabsContent value="bulk-upload">
            <BulkUpload />
          </TabsContent>

          <TabsContent value="polls">
            {showCreateForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  {editingPoll ? 'Edit Poll' : 'Create New Poll'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Options</Label>
                    {formData.options.map((option, index) => (
                      <Input
                        key={index}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="mt-2"
                        required={index < 2}
                      />
                    ))}
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      {editingPoll ? 'Update Poll' : 'Create Poll'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingPoll(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Manage Polls</h2>
              </div>
              <div className="divide-y">
                {polls.map((poll) => (
                  <div key={poll.id} className="p-6 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium">{poll.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          poll.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {poll.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{poll.description}</p>
                      <div className="text-sm text-gray-500">
                        {poll.options.length} options • Created {new Date(poll.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePollStatus(poll)}
                      >
                        {poll.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(poll)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePoll(poll.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {polls.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No polls created yet. Create your first poll!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Poll Analytics</CardTitle>
                <CardDescription>
                  Detailed statistics about your polls and user engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Poll Performance</h3>
                      <p className="text-sm text-gray-600">
                        Average votes per poll: {polls.length > 0 ? Math.round(analytics.totalVotes / polls.length) : 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Active poll ratio: {polls.length > 0 ? Math.round((analytics.activePolls / analytics.totalPolls) * 100) : 0}%
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">User Engagement</h3>
                      <p className="text-sm text-gray-600">
                        Average votes per user: {analytics.totalUsers > 0 ? Math.round(analytics.totalVotes / analytics.totalUsers) : 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total registered users: {analytics.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
