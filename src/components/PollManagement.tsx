
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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

interface PollManagementProps {
  polls: Poll[];
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  editingPoll: Poll | null;
  setEditingPoll: (poll: Poll | null) => void;
  formData: {
    title: string;
    description: string;
    category: string;
    options: string[];
  };
  setFormData: (data: any) => void;
  onRefresh: () => void;
  user: any;
}

const PollManagement = ({
  polls,
  showCreateForm,
  setShowCreateForm,
  editingPoll,
  setEditingPoll,
  formData,
  setFormData,
  onRefresh,
  user
}: PollManagementProps) => {
  const { toast } = useToast();

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
            is_active: true,
          });

        if (error) throw error;
        toast({ title: "Poll created successfully!" });
      }

      setFormData({ title: '', description: '', category: 'General', options: ['', '', '', ''] });
      setShowCreateForm(false);
      setEditingPoll(null);
      onRefresh();
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
      onRefresh();
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
      onRefresh();
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

  return (
    <div className="space-y-6">
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
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
          <p className="text-gray-600">View and manage all polls in the system</p>
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
  );
};

export default PollManagement;
