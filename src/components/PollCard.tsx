
import { useState, useEffect } from 'react';
import { DatabasePoll } from '@/hooks/usePolls';
import { useVotes } from '@/hooks/useVotes';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PollResult from './PollResult';
import SocialShare from './SocialShare';
import AuthModal from './AuthModal';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface PollCardProps {
  poll: DatabasePoll;
  isActive: boolean;
  onVote?: () => void;
}

const PollCard = ({ poll, isActive, onVote }: PollCardProps) => {
  const { userVote, votes, loading, castVote } = useVotes(poll.id);
  const { bookmarkedPolls, toggleBookmark, loading: bookmarkLoading } = useBookmarks();
  const { user } = useAuth();
  const [hasVoted, setHasVoted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultTimer, setResultTimer] = useState<NodeJS.Timeout | null>(null);
  const isBookmarked = bookmarkedPolls.has(poll.id);

  useEffect(() => {
    if (user) {
      setHasVoted(!!userVote);
      setShowResult(!!userVote);
    } else {
      // For non-authenticated users, always show results
      setShowResult(true);
      setHasVoted(false);
    }
  }, [userVote, user]);

  const handleVote = async (optionId: string) => {
    if (loading || !user) return;
    
    const success = await castVote(optionId);
    if (success) {
      setHasVoted(true);
      setShowResult(true);
      
      // Set a timer to automatically move to next poll after 5 seconds
      const timer = setTimeout(() => {
        onVote?.();
      }, 5000);
      setResultTimer(timer);
    }
  };

  const handleBookmarkToggle = async () => {
    if (bookmarkLoading) return;
    await toggleBookmark(poll.id);
  };

  // Clear timer when component unmounts or poll changes
  useEffect(() => {
    return () => {
      if (resultTimer) {
        clearTimeout(resultTimer);
      }
    };
  }, [resultTimer]);

  // Clear timer when poll becomes inactive
  useEffect(() => {
    if (!isActive && resultTimer) {
      clearTimeout(resultTimer);
      setResultTimer(null);
    }
  }, [isActive, resultTimer]);

  const getCategoryColor = () => {
    const category = poll.category?.toLowerCase() || '';
    if (category.includes('technology') || category.includes('tech')) return 'bg-blue-500';
    if (category.includes('food') || category.includes('drink')) return 'bg-yellow-500';
    if (category.includes('entertainment') || category.includes('gaming')) return 'bg-purple-500';
    if (category.includes('health') || category.includes('fitness')) return 'bg-green-500';
    if (category.includes('education') || category.includes('learning')) return 'bg-indigo-500';
    return 'bg-gray-500';
  };

  const getCategoryGradient = () => {
    const category = poll.category?.toLowerCase() || '';
    if (category.includes('technology') || category.includes('tech')) return 'from-blue-50 to-blue-100';
    if (category.includes('food') || category.includes('drink')) return 'from-yellow-50 to-yellow-100';
    if (category.includes('entertainment') || category.includes('gaming')) return 'from-purple-50 to-purple-100';
    if (category.includes('health') || category.includes('fitness')) return 'from-green-50 to-green-100';
    if (category.includes('education') || category.includes('learning')) return 'from-indigo-50 to-indigo-100';
    return 'from-gray-50 to-gray-100';
  };

  // Merge database votes with poll options
  const optionsWithVotes = poll.options.map(option => ({
    ...option,
    votes: votes[option.id] || 0
  }));

  // Create poll object compatible with PollResult component
  const pollForResult = {
    id: parseInt(poll.id.replace(/-/g, '').substring(0, 8), 16),
    question: poll.title,
    category: poll.category as "Politics" | "Celebrity" | "Scientists" | "Geography",
    options: optionsWithVotes
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 transition-all duration-700 ${
        isActive ? 'opacity-100 scale-100' : 'opacity-70 scale-95'
      }`}
      data-poll-card
    >
      <div className={`w-full max-w-2xl bg-gradient-to-br ${getCategoryGradient()} rounded-2xl shadow-2xl p-4 sm:p-8 transform transition-all duration-500 ${
        isActive ? 'animate-fade-in' : ''
      }`}>
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`inline-block px-3 py-1 sm:px-4 sm:py-2 ${getCategoryColor()} text-white rounded-full text-xs sm:text-sm font-semibold mb-1 transform transition-all duration-300 hover:scale-105`}>
              {poll.category}
            </div>
            <div className="flex items-center space-x-2">
              <SocialShare pollId={poll.id} pollTitle={poll.title} />
              {user && (
                <Button
                  onClick={handleBookmarkToggle}
                  variant="ghost"
                  size="sm"
                  disabled={bookmarkLoading}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 leading-tight px-2">
            {poll.title}
          </h2>
          {poll.description && (
            <p className="text-gray-600 text-sm sm:text-lg mb-4 px-2">{poll.description}</p>
          )}
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-500 mx-auto rounded-full"></div>
        </div>

        {!showResult && user ? (
          <div className="space-y-3 sm:space-y-4">
            <p className="text-center text-gray-600 mb-4 sm:mb-6 text-sm sm:text-lg">Cast your vote:</p>
            {optionsWithVotes.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={loading}
                className={`w-full p-3 sm:p-4 text-left rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in text-sm sm:text-base ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 pr-2">
                    {option.text}
                  </span>
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${getCategoryColor()} border-opacity-30 flex items-center justify-center transition-all duration-200 hover:border-opacity-60 flex-shrink-0`}>
                    <div className="w-2 h-2 rounded-full bg-transparent"></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <PollResult 
              poll={pollForResult} 
              selectedOption={userVote || ''} 
            />
            
            {hasVoted && resultTimer && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">Moving to next poll in 5 seconds...</p>
              </div>
            )}
          </div>
        )}

        {/* Sign in button moved to bottom for non-logged in users */}
        {!user && (
          <div className="flex justify-center mt-6">
            <AuthModal defaultTab="signin">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium">
                Sign in to vote
              </Button>
            </AuthModal>
          </div>
        )}

        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-gray-500">
            WPCS Poll
          </p>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
