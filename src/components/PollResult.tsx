
import { useEffect, useState } from 'react';
import { Poll } from '@/data/pollData';

interface PollResultProps {
  poll: Poll;
  selectedOption: string;
}

const PollResult = ({ poll, selectedOption }: PollResultProps) => {
  const [animationStep, setAnimationStep] = useState(0);
  
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 300);
    const timer2 = setTimeout(() => setAnimationStep(2), 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Politics': return 'from-blue-500 to-blue-600';
      case 'Celebrity': return 'from-pink-500 to-pink-600';
      case 'Scientists': return 'from-green-500 to-green-600';
      case 'Geography': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className={`text-center transform transition-all duration-700 ${
        animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Poll Results</h3>
        <p className="text-gray-600">Total votes: {totalVotes.toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option.votes);
          const isSelected = option.id === selectedOption;
          
          return (
            <div
              key={option.id}
              className={`transform transition-all duration-700 ${
                animationStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                isSelected 
                  ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105' 
                  : 'border-gray-200 bg-white hover:shadow-md'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${isSelected ? 'text-yellow-800' : 'text-gray-700'}`}>
                    {option.text}
                    {isSelected && <span className="ml-2 text-yellow-600">✓ Your vote</span>}
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    {percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getCategoryColor(poll.category)} transition-all duration-1000 ease-out ${
                      animationStep >= 2 && isSelected ? 'animate-pulse' : ''
                    }`}
                    style={{
                      width: animationStep >= 2 ? `${percentage}%` : '0%',
                      transitionDelay: `${index * 200}ms`
                    }}
                  />
                </div>
                
                <div className="mt-1 text-sm text-gray-500">
                  {option.votes.toLocaleString()} votes
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollResult;
