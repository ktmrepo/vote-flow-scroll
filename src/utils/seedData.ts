
import { supabase } from '@/integrations/supabase/client';

// Function to seed realistic votes for existing polls
export const seedVoteData = async () => {
  try {
    // First, get all existing polls
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('id, options')
      .eq('is_active', true);

    if (pollsError || !polls) {
      console.error('Error fetching polls:', pollsError);
      return;
    }

    // Create realistic voting patterns for each poll
    const votePromises = polls.map(async (poll) => {
      if (!Array.isArray(poll.options)) return;
      
      const options = poll.options as Array<{ id: string; text: string; votes: number; color: string }>;
      
      // Generate random votes for each option (between 5-50 votes per option)
      const votes = [];
      
      for (const option of options) {
        const voteCount = Math.floor(Math.random() * 45) + 5; // 5-50 votes
        
        for (let i = 0; i < voteCount; i++) {
          // Create a fake user ID for demo purposes
          const fakeUserId = `fake-user-${Math.random().toString(36).substr(2, 9)}`;
          
          votes.push({
            poll_id: poll.id,
            user_id: fakeUserId,
            option_id: option.id,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
          });
        }
      }
      
      // Insert votes in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < votes.length; i += batchSize) {
        const batch = votes.slice(i, i + batchSize);
        const { error } = await supabase
          .from('votes')
          .insert(batch);
        
        if (error) {
          console.error('Error inserting vote batch:', error);
        }
      }
    });

    await Promise.all(votePromises);
    console.log('Successfully seeded vote data');
  } catch (error) {
    console.error('Error seeding vote data:', error);
  }
};
