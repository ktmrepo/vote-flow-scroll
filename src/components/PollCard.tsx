
import { useState } from 'react';
import { Poll } from '@/data/pollData';
import PollResult from './PollResult';

interface PollCardProps {
  poll: Poll;
  isActive: boolean;
}

const PollCard = ({ poll, isActive }: PollCardProps) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleVote = (optionId: string) => {
    if (!hasVoted) {
      setSelectedOption(optionId);
      setHasVoted(true);
      
      // Update vote count (in a real app, this would be sent to backend)
      const option = poll.options.find(opt => opt.id === optionId);
      if (option) {
        option.votes += 1;
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Politics': return 'bg-blue-500';
      case 'Celebrity': return 'bg-pink-500';
      case 'Scientists': return 'bg-green-500';
      case 'Geography': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'Politics': return 'from-blue-50 to-blue-100';
      case 'Celebrity': return 'from-pink-50 to-pink-100';
      case 'Scientists': return 'from-green-50 to-green-100';
      case 'Geography': return 'from-purple-50 to-purple-100';
      default: return 'from-gray-50 to-gray-100';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-700 ${
      isActive ? 'opacity-100 scale-100' : 'opacity-70 scale-95'
    }`}>
      <div className={`w-full max-w-2xl bg-gradient-to-br ${getCategoryGradient(poll.category)} rounded-2xl shadow-2xl p-8 transform transition-all duration-500 ${
        isActive ? 'animate-fade-in' : ''
      }`}>
        <div className="text-center mb-8">
          <div className={`inline-block px-4 py-2 ${getCategoryColor(poll.category)} text-white rounded-full text-sm font-semibold mb-4 transform transition-all duration-300 hover:scale-105`}>
            {poll.category}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
            {poll.question}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-500 mx-auto rounded-full"></div>
        </div>

        {!hasVoted ? (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6 text-lg">Cast your vote or scroll to continue:</p>
            {poll.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className={`w-full p-4 text-left rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-700">
                    {option.text}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 ${getCategoryColor(poll.category)} border-opacity-30 flex items-center justify-center transition-all duration-200 hover:border-opacity-60`}>
                    <div className="w-2 h-2 rounded-full bg-transparent"></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <PollResult poll={poll} selectedOption={selectedOption} />
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Poll {poll.id} of 20 • WPCS Poll
          </p>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
