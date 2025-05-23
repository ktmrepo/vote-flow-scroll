
interface ScrollIndicatorProps {
  currentPoll: number;
  totalPolls: number;
}

const ScrollIndicator = ({ currentPoll, totalPolls }: ScrollIndicatorProps) => {
  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="flex flex-col space-y-2">
        {Array.from({ length: totalPolls }, (_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentPoll
                ? 'bg-blue-500 scale-125 shadow-lg'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        {currentPoll + 1}/{totalPolls}
      </div>
    </div>
  );
};

export default ScrollIndicator;
