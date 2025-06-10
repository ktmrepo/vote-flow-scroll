
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Users, BarChart3, Vote, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';

interface PollOption {
  id: string;
  text: string;
  votes?: number;
  color?: string;
}

const BulkUpload = () => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Enhanced CSV Templates
  const userTemplate = `email,full_name,role
john.doe@example.com,John Doe,user
jane.admin@example.com,Jane Admin,admin
mike.user@example.com,Mike User,user
sarah.moderator@example.com,Sarah Moderator,user
alex.reviewer@example.com,Alex Reviewer,user`;

  const pollTemplate = `title,description,category,option1,option2,option3,option4,option5
"What's your favorite programming language?","Choose your preferred programming language for web development",Technology,JavaScript,Python,Java,C++,Go
"Best pizza topping?","Vote for the ultimate pizza topping",Food & Drink,Pepperoni,Mushrooms,Cheese,Pineapple,Sausage
"Preferred workout time?","When do you prefer to exercise?",Health & Fitness,Morning,Afternoon,Evening,Night,
"Best social media platform?","Which platform do you use most?",Social Media,Instagram,Twitter,Facebook,TikTok,LinkedIn
"Favorite movie genre?","What type of movies do you enjoy most?",Entertainment,Action,Comedy,Drama,Horror,Sci-Fi`;

  const voteTemplate = `poll_title,user_email,option_text,votes_count
"What's your favorite programming language?",john.doe@example.com,JavaScript,1
"What's your favorite programming language?",jane.admin@example.com,Python,1
"Best pizza topping?",mike.user@example.com,Pepperoni,1
"Best pizza topping?",sarah.moderator@example.com,Mushrooms,1
"Preferred workout time?",alex.reviewer@example.com,Morning,1`;

  const randomVoteTemplate = `poll_title,total_votes,distribution_type
"What's your favorite programming language?",50,random
"Best pizza topping?",75,weighted
"Preferred workout time?",30,equal
"Best social media platform?",100,random
"Favorite movie genre?",45,weighted`;

  const downloadTemplate = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      
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

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(uploadType);
    setUploadProgress(0);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        throw new Error("CSV file is empty or invalid");
      }

      setUploadProgress(25);

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

      setUploadProgress(50);

      let successCount = 0;
      let errorCount = 0;

      if (uploadType === 'users') {
        const result = await processUserUpload(data, uploadSession.id);
        successCount = result.success;
        errorCount = result.errors;
      } else if (uploadType === 'polls') {
        const result = await processPollUpload(data, uploadSession.id);
        successCount = result.success;
        errorCount = result.errors;
      } else if (uploadType === 'votes') {
        const result = await processVoteUpload(data, uploadSession.id);
        successCount = result.success;
        errorCount = result.errors;
      } else if (uploadType === 'random_votes') {
        const result = await processRandomVoteUpload(data, uploadSession.id);
        successCount = result.success;
        errorCount = result.errors;
      }

      setUploadProgress(100);

      // Update session with results
      await supabase
        .from('bulk_uploads')
        .update({
          status: 'completed',
          successful_records: successCount,
          failed_records: errorCount,
          completed_at: new Date().toISOString()
        })
        .eq('id', uploadSession.id);

      toast({
        title: "Upload completed",
        description: `Successfully processed ${successCount} records. ${errorCount} failed.`,
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const processUserUpload = async (data: any[], sessionId: string) => {
    let success = 0;
    let errors = 0;

    for (const row of data) {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors++;
          continue;
        }

        // Check if user already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', row.email)
          .single();

        if (existingProfile) {
          errors++; // User already exists
          continue;
        }

        // Create profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            email: row.email,
            full_name: row.full_name || row.email,
            role: row.role || 'user'
          });

        if (error) {
          errors++;
        } else {
          success++;
        }
      } catch (error) {
        errors++;
      }
    }

    return { success, errors };
  };

  const processPollUpload = async (data: any[], sessionId: string) => {
    let success = 0;
    let errors = 0;

    for (const row of data) {
      try {
        const options = [row.option1, row.option2, row.option3, row.option4, row.option5]
          .filter(Boolean)
          .map((text, index) => ({
            id: text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
            text: text.trim(),
            votes: 0,
            color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index] || '#6b7280'
          }));

        if (options.length < 2) {
          errors++;
          continue;
        }

        const { error } = await supabase
          .from('polls')
          .insert({
            title: row.title,
            description: row.description || null,
            category: row.category || 'General',
            options: options,
            created_by: user!.id,
            is_active: true
          });

        if (error) {
          errors++;
        } else {
          success++;
        }
      } catch (error) {
        errors++;
      }
    }

    return { success, errors };
  };

  const processVoteUpload = async (data: any[], sessionId: string) => {
    let success = 0;
    let errors = 0;

    for (const row of data) {
      try {
        // Find poll by title
        const { data: poll } = await supabase
          .from('polls')
          .select('id, options')
          .eq('title', row.poll_title)
          .single();

        if (!poll) {
          errors++;
          continue;
        }

        // Safely parse options and find the matching option
        const options: PollOption[] = Array.isArray(poll.options) 
          ? (poll.options as unknown as PollOption[]) 
          : [];
        const option = options.find((opt: PollOption) => opt.text === row.option_text);

        if (!option) {
          errors++;
          continue;
        }

        // Create votes
        const votesCount = parseInt(row.votes_count) || 1;
        for (let i = 0; i < votesCount; i++) {
          const { error } = await supabase
            .from('votes')
            .insert({
              poll_id: poll.id,
              option_id: option.id,
              user_id: user!.id
            });

          if (error) {
            errors++;
          } else {
            success++;
          }
        }
      } catch (error) {
        errors++;
      }
    }

    return { success, errors };
  };

  const processRandomVoteUpload = async (data: any[], sessionId: string) => {
    let success = 0;
    let errors = 0;

    for (const row of data) {
      try {
        // Find poll by title
        const { data: poll } = await supabase
          .from('polls')
          .select('id, options')
          .eq('title', row.poll_title)
          .single();

        if (!poll) {
          errors++;
          continue;
        }

        // Safely parse options with proper typing
        const options: PollOption[] = Array.isArray(poll.options) 
          ? (poll.options as unknown as PollOption[]) 
          : [];
        if (options.length === 0) {
          errors++;
          continue;
        }

        const totalVotes = parseInt(row.total_votes) || 10;
        const distributionType = row.distribution_type || 'random';

        // Generate random votes
        for (let i = 0; i < totalVotes; i++) {
          let selectedOption: PollOption;
          
          if (distributionType === 'equal') {
            selectedOption = options[i % options.length];
          } else if (distributionType === 'weighted') {
            // First option gets more votes
            const rand = Math.random();
            if (rand < 0.4) {
              selectedOption = options[0];
            } else if (rand < 0.7 && options[1]) {
              selectedOption = options[1];
            } else {
              selectedOption = options[Math.floor(Math.random() * options.length)];
            }
          } else {
            // Random distribution
            selectedOption = options[Math.floor(Math.random() * options.length)];
          }

          const { error } = await supabase
            .from('votes')
            .insert({
              poll_id: poll.id,
              option_id: selectedOption.id,
              user_id: user!.id
            });

          if (error) {
            errors++;
          } else {
            success++;
          }
        }
      } catch (error) {
        errors++;
      }
    }

    return { success, errors };
  };

  const UploadSection = ({ 
    title, 
    description, 
    icon: Icon, 
    uploadType, 
    template, 
    templateFilename 
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    uploadType: string;
    template: string;
    templateFilename: string;
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <Icon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {uploading === uploadType && (
        <div className="mb-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-500 mt-2">Processing... {uploadProgress}%</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Button
          onClick={() => downloadTemplate(template, templateFilename)}
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
            onChange={(e) => handleFileUpload(e, uploadType)}
            className="hidden"
            id={`${uploadType}-upload`}
            disabled={uploading === uploadType}
          />
          <Button
            onClick={() => document.getElementById(`${uploadType}-upload`)?.click()}
            disabled={uploading === uploadType}
          >
            {uploading === uploadType ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Upload System
        </CardTitle>
        <CardDescription>
          Upload CSV files to bulk import users, polls, and generate votes. Maximum file size: 10MB
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Important Notes:</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>Always download and review the CSV templates before uploading</li>
                <li>Ensure your CSV files follow the exact format shown in templates</li>
                <li>Large files may take several minutes to process</li>
                <li>Failed records will be skipped with error reporting</li>
              </ul>
            </div>
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="random_votes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Random Votes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UploadSection
              title="Upload Users"
              description="Upload user accounts with email, name, and role information"
              icon={Users}
              uploadType="users"
              template={userTemplate}
              templateFilename="sample_users.csv"
            />
          </TabsContent>

          <TabsContent value="polls" className="space-y-4">
            <UploadSection
              title="Upload Polls"
              description="Upload poll questions with options and categories"
              icon={BarChart3}
              uploadType="polls"
              template={pollTemplate}
              templateFilename="sample_polls.csv"
            />
          </TabsContent>

          <TabsContent value="votes" className="space-y-4">
            <UploadSection
              title="Upload Votes"
              description="Upload specific votes for existing polls and users"
              icon={Vote}
              uploadType="votes"
              template={voteTemplate}
              templateFilename="sample_votes.csv"
            />
          </TabsContent>

          <TabsContent value="random_votes" className="space-y-4">
            <UploadSection
              title="Generate Random Votes"
              description="Generate random vote distributions for existing polls to simulate engagement"
              icon={FileText}
              uploadType="random_votes"
              template={randomVoteTemplate}
              templateFilename="sample_random_votes.csv"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BulkUpload;
