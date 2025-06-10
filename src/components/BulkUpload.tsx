
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Users, BarChart3, Vote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BulkUpload = () => {
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // CSV Templates
  const userTemplate = `email,full_name,role
john.doe@example.com,John Doe,user
jane.admin@example.com,Jane Admin,admin
mike.user@example.com,Mike User,user`;

  const pollTemplate = `title,description,category,option1,option2,option3,option4
"What's your favorite programming language?","Choose your preferred programming language",Technology,JavaScript,Python,Java,C++
"Best pizza topping?","Vote for the best pizza topping",Food & Drink,Pepperoni,Mushrooms,Cheese,Pineapple
"Preferred workout time?","When do you prefer to exercise?",Health & Fitness,Morning,Afternoon,Evening,Night`;

  const voteTemplate = `poll_id,option_id,votes_count
poll-uuid-1,javascript,25
poll-uuid-1,python,30
poll-uuid-2,pepperoni,15
poll-uuid-2,mushrooms,10`;

  const downloadTemplate = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, uploadType: string) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(uploadType);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      const { data: uploadSession, error: sessionError } = await supabase
        .from('bulk_uploads')
        .insert({
          uploaded_by: user.id,
          upload_type: uploadType,
          file_name: file.name,
          total_records: data.length
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      if (uploadType === 'users') {
        await processUserUpload(data, uploadSession.id);
      } else if (uploadType === 'polls') {
        await processPollUpload(data, uploadSession.id);
      } else if (uploadType === 'votes') {
        await processVoteUpload(data, uploadSession.id);
      }

      toast({
        title: "Upload successful",
        description: `Successfully processed ${data.length} ${uploadType} records`,
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
      event.target.value = '';
    }
  };

  const processUserUpload = async (data: any[], sessionId: string) => {
    const tempUsers = data.map(row => ({
      upload_session_id: sessionId,
      email: row.email,
      full_name: row.full_name,
      role: row.role || 'user'
    }));

    const { error } = await supabase
      .from('temp_user_uploads')
      .insert(tempUsers);

    if (error) throw error;

    const { error: processError } = await supabase.rpc('process_user_bulk_upload', {
      upload_session_id: sessionId
    });

    if (processError) throw processError;
  };

  const processPollUpload = async (data: any[], sessionId: string) => {
    const tempPolls = data.map(row => {
      const options = [row.option1, row.option2, row.option3, row.option4]
        .filter(Boolean)
        .map((text, index) => ({
          id: text.toLowerCase().replace(/\s+/g, '_'),
          text: text.trim(),
          votes: 0,
          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index] || '#6b7280'
        }));

      return {
        upload_session_id: sessionId,
        title: row.title,
        description: row.description,
        category: row.category || 'General',
        options: JSON.stringify(options),
        created_by: user!.id
      };
    });

    const { error } = await supabase
      .from('temp_poll_uploads')
      .insert(tempPolls);

    if (error) throw error;

    const { error: processError } = await supabase.rpc('process_poll_bulk_upload', {
      upload_session_id: sessionId
    });

    if (processError) throw processError;
  };

  const processVoteUpload = async (data: any[], sessionId: string) => {
    for (const row of data) {
      const votesCount = parseInt(row.votes_count) || 1;
      
      for (let i = 0; i < votesCount; i++) {
        await supabase
          .from('votes')
          .insert({
            poll_id: row.poll_id,
            option_id: row.option_id,
            user_id: user!.id
          });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Upload Data
        </CardTitle>
        <CardDescription>
          Upload CSV files to bulk import users, polls, and votes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Polls
            </TabsTrigger>
            <TabsTrigger value="votes" className="flex items-center gap-2">
              <Vote className="w-4 h-4" />
              Votes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Upload Users</h3>
              <p className="text-gray-600 mb-4">Upload a CSV file with user data</p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => downloadTemplate(userTemplate, 'sample_users.csv')}
                  variant="outline"
                  className="mr-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, 'users')}
                    className="hidden"
                    id="users-upload"
                    disabled={uploading === 'users'}
                  />
                  <Button
                    onClick={() => document.getElementById('users-upload')?.click()}
                    disabled={uploading === 'users'}
                  >
                    {uploading === 'users' ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="polls" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Upload Polls</h3>
              <p className="text-gray-600 mb-4">Upload a CSV file with poll questions and options</p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => downloadTemplate(pollTemplate, 'sample_polls.csv')}
                  variant="outline"
                  className="mr-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, 'polls')}
                    className="hidden"
                    id="polls-upload"
                    disabled={uploading === 'polls'}
                  />
                  <Button
                    onClick={() => document.getElementById('polls-upload')?.click()}
                    disabled={uploading === 'polls'}
                  >
                    {uploading === 'polls' ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="votes" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Vote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Upload Votes</h3>
              <p className="text-gray-600 mb-4">Upload a CSV file with vote data for existing polls</p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => downloadTemplate(voteTemplate, 'sample_votes.csv')}
                  variant="outline"
                  className="mr-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, 'votes')}
                    className="hidden"
                    id="votes-upload"
                    disabled={uploading === 'votes'}
                  />
                  <Button
                    onClick={() => document.getElementById('votes-upload')?.click()}
                    disabled={uploading === 'votes'}
                  >
                    {uploading === 'votes' ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BulkUpload;
