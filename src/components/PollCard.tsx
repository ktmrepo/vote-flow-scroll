
import { useState, useEffect } from 'react';
import { DatabasePoll } from '@/hooks/usePolls';
import { useVotes } from '@/hooks/useVotes';
import PollResult from './PollResult';

interface PollCardProps {
  poll: DatabasePoll;
  isActive: boolean;
  onVote?: () => void;
}

const PollCard = ({ poll, isActive, onVote }: PollCardProps) => {
  const { userVote, votes, loading, castVote } = useVotes(poll.id);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setHasVoted(!!userVote);
  }, [userVote]);

  const handleVote = async (optionId: string) => {
    if (loading) return;
    
    const success = await castVote(optionId);
    if (success) {
      setHasVoted(true);
      onVote?.();
    }
  };

  const getCategoryColor = () => {
    // Simple color mapping based on poll title
    const title = poll.title.toLowerCase();
    if (title.includes('programming') || title.includes('tech')) return 'bg-blue-500';
    if (title.includes('framework') || title.includes('frontend')) return 'bg-green-500';
    if (title.includes('coffee') || title.includes('food')) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  const getCategoryGradient = () => {
    const title = poll.title.toLowerCase();
    if (title.includes('programming') || title.includes('tech')) return 'from-blue-50 to-blue-100';
    if (title.includes('framework') || title.includes('frontend')) return 'from-green-50 to-green-100';
    if (title.includes('coffee') || title.includes('food')) return 'from-yellow-50 to-yellow-100';
    return 'from-purple-50 to-purple-100';
  };

  // Merge database votes with poll options
  const optionsWithVotes = poll.options.map(option => ({
    ...option,
    votes: votes[option.id] || 0
  }));

  // Create poll object compatible with PollResult component - convert string id to number
  const pollForResult = {
    id: parseInt(poll.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number for compatibility
    question: poll.title,
    category: 'Poll',
    options: optionsWithVotes
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-700 ${
      isActive ? 'opacity-100 scale-100' : 'opacity-70 scale-95'
    }`}>
      <div className={`w-full max-w-2xl bg-gradient-to-br ${getCategoryGradient()} rounded-2xl shadow-2xl p-8 transform transition-all duration-500 ${
        isActive ? 'animate-fade-in' : ''
      }`}>
        <div className="text-center mb-8">
          <div className={`inline-block px-4 py-2 ${getCategoryColor()} text-white rounded-full text-sm font-semibold mb-4 transform transition-all duration-300 hover:scale-105`}>
            Poll
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
            {poll.title}
          </h2>
          {poll.description && (
            <p className="text-gray-600 text-lg mb-4">{poll.description}</p>
          )}
          <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-500 mx-auto rounded-full"></div>
        </div>

        {!hasVoted ? (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6 text-lg">Cast your vote or swipe to continue:</p>
            {optionsWithVotes.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={loading}
                className={`w-full p-4 text-left rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-700">
                    {option.text}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 ${getCategoryColor()} border-opacity-30 flex items-center justify-center transition-all duration-200 hover:border-opacity-60`}>
                    <div className="w-2 h-2 rounded-full bg-transparent"></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <PollResult 
            poll={pollForResult} 
            selectedOption={userVote || ''} 
          />
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            WPCS Poll
          </p>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
