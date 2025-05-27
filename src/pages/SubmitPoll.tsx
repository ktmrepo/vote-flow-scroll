
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Send } from 'lucide-react';

const SubmitPoll = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    options: ['', '']
  });
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form
    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast({
        title: "Invalid form",
        description: "Please provide at least 2 options",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Invalid form",
        description: "Please provide a poll title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const options = validOptions.map((text, index) => ({
        id: text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        text: text.trim(),
        votes: 0,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'][index] || '#6b7280'
      }));

      const { error } = await supabase
        .from('polls')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          options: options,
          created_by: user.id,
          is_active: false // Polls need admin approval
        });

      if (error) throw error;

      toast({
        title: "Poll submitted!",
        description: "Your poll has been submitted for review. It will be activated once approved by an admin.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        options: ['', '']
      });

      // Navigate back to main page
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error submitting poll",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit a Poll</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Polls
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Create New Poll
            </CardTitle>
            <CardDescription>
              Submit a poll for community voting. Your poll will be reviewed by admins before being published.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Poll Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What's your question?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide additional context for your poll..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Technology, Sports, Entertainment"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Options *</Label>
                <p className="text-sm text-gray-600 mb-3">Add 2-6 options for your poll</p>
                
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required={index < 2}
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="shrink-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {formData.options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Review Process</h4>
                <p className="text-sm text-blue-700">
                  Your poll will be reviewed by our admin team before being published. 
                  This helps ensure quality content and prevents spam. You'll be notified 
                  once your poll goes live!
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Submitting...' : 'Submit Poll for Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitPoll;
