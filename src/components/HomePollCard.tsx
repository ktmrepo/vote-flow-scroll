import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabasePoll } from '@/hooks/usePolls';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import SocialShare from './SocialShare';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark, BookmarkCheck, Vote } from 'lucide-react';

interface HomePollCardProps {
  poll: DatabasePoll;
}

const HomePollCard = ({ poll }: HomePollCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookmarkedPolls, toggleBookmark, loading: bookmarkLoading } = useBookmarks();
  const isBookmarked = bookmarkedPolls.has(poll.id);

  const handleBookmarkToggle = async () => {
    if (bookmarkLoading) return;
    await toggleBookmark(poll.id);
  };

  const handleVoteClick = () => {
    // Navigate to the poll viewing page with the specific poll
    navigate(`/poll/${poll.id}`);
  };

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

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="w-full h-full">
      <div className={`bg-gradient-to-br ${getCategoryGradient()} rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col`}>
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-block px-2 py-1 ${getCategoryColor()} text-white rounded-full text-xs font-semibold`}>
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
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 leading-tight px-2 min-h-[3rem] flex items-center justify-center">
            {poll.title}
          </h2>
        </div>

        <div className="text-center mb-6 flex-grow flex items-center justify-center">
          <p className="text-sm text-gray-600">
            Total votes: {totalVotes.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-center mt-auto">
          <Button
            onClick={handleVoteClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 w-full justify-center"
          >
            <Vote className="w-4 h-4" />
            Vote on this poll
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePollCard;