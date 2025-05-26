
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  description: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    color: string;
  }>;
  is_active: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
    }
  }, [user, isAdmin]);

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching polls",
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
            options: options,
            created_by: user!.id,
          });

        if (error) throw error;
        toast({ title: "Poll created successfully!" });
      }

      setFormData({ title: '', description: '', options: ['', '', '', ''] });
      setShowCreateForm(false);
      setEditingPoll(null);
      fetchPolls();
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
      description: poll.description,
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
                setFormData({ title: '', description: '', options: ['', '', '', ''] });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Admin;
