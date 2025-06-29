import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabasePoll } from '@/hooks/usePolls';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import SocialShare from './SocialShare';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useVotes } from '@/hooks/useVotes';
import { Bookmark, BookmarkCheck, Vote, TrendingUp } from 'lucide-react';

interface TrendingPollCardProps {
  poll: DatabasePoll;
}

const TrendingPollCard = ({ poll }: TrendingPollCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookmarkedPolls, toggleBookmark, loading: bookmarkLoading } = useBookmarks();
  const { votes } = useVotes(poll.id);
  const isBookmarked = bookmarkedPolls.has(poll.id);

  const handleBookmarkToggle = async () => {
    if (bookmarkLoading) return;
    await toggleBookmark(poll.id);
  };

  const handleVoteClick = () => {
    // Create a clean URL slug from the poll title
    const titleSlug = poll.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 50); // Limit length

    // Navigate to the poll viewing page with clean URL
    navigate(`/poll/${poll.id}/${titleSlug}`);
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

  // Calculate total votes and find most voted option
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const mostVotedOption = poll.options.reduce((max, option) => {
    const optionVotes = votes[option.id] || 0;
    const maxVotes = votes[max.id] || 0;
    return optionVotes > maxVotes ? option : max;
  }, poll.options[0]);
  const mostVotedCount = votes[mostVotedOption?.id] || 0;

  return (
    <div className="w-full h-full">
      <div className={`bg-gradient-to-br ${getCategoryGradient()} rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col border-2 border-red-200`}>
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`inline-block px-2 py-1 ${getCategoryColor()} text-white rounded-full text-xs font-semibold`}>
                {poll.category}
              </div>
              <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                Trending
              </div>
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

        {/* Most voted option display */}
        <div className="mb-4 flex-grow">
          <div className="bg-white/70 rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Most voted option:</p>
              <p className="font-semibold text-gray-800 mb-2">{mostVotedOption?.text}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="font-bold text-lg text-blue-600">{mostVotedCount}</span>
                <span>votes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Total votes: {totalVotes.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-center mt-auto">
          <Button
            onClick={handleVoteClick}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 w-full justify-center"
          >
            <Vote className="w-4 h-4" />
            Vote on this poll
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrendingPollCard;