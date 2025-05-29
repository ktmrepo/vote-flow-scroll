
import { supabase } from '@/integrations/supabase/client';

export const seedVoteData = async () => {
  try {
    console.log('Starting to seed vote data...');
    
    // Get all active polls
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('id, options')
      .eq('is_active', true);

    if (pollsError) throw pollsError;
    
    if (!polls || polls.length === 0) {
      console.log('No active polls found to seed votes for');
      return;
    }

    // Random user IDs (these should match the ones created in the SQL)
    const randomUserIds = [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      '55555555-5555-5555-5555-555555555555',
      '66666666-6666-6666-6666-666666666666',
      '77777777-7777-7777-7777-777777777777',
      '88888888-8888-8888-8888-888888888888',
      '99999999-9999-9999-9999-999999999999',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ];

    let totalVotesAdded = 0;

    for (const poll of polls) {
      // Parse options from the poll
      const options = Array.isArray(poll.options) ? poll.options : [];
      
      for (const option of options) {
        if (option && typeof option === 'object' && 'id' in option) {
          // Add random votes for this option
          const numberOfVotes = Math.floor(Math.random() * 5) + 1; // 1-5 votes per option
          
          for (let i = 0; i < numberOfVotes; i++) {
            const randomUserId = randomUserIds[Math.floor(Math.random() * randomUserIds.length)];
            
            // Check if this user already voted for this poll
            const { data: existingVote } = await supabase
              .from('votes')
              .select('id')
              .eq('poll_id', poll.id)
              .eq('user_id', randomUserId)
              .maybeSingle();
            
            if (!existingVote) {
              const { error: voteError } = await supabase
                .from('votes')
                .insert({
                  poll_id: poll.id,
                  user_id: randomUserId,
                  option_id: String(option.id), // Convert to string
                  created_at: new Date().toISOString()
                });
                
              if (!voteError) {
                totalVotesAdded++;
              }
            }
          }
        }
      }
    }

    console.log(`Seeded ${totalVotesAdded} votes across ${polls.length} polls`);
    return totalVotesAdded;
  } catch (error) {
    console.error('Error seeding vote data:', error);
    return 0;
  }
};
