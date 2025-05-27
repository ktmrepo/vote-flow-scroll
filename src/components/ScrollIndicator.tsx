
interface ScrollIndicatorProps {
  currentIndex: number;
  total: number;
  onIndexChange: (index: number) => void;
}

const ScrollIndicator = ({ currentIndex, total, onIndexChange }: ScrollIndicatorProps) => {
  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="flex flex-col space-y-2">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? 'bg-blue-500 scale-125 shadow-lg'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => onIndexChange(index)}
          />
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        {currentIndex + 1}/{total}
      </div>
    </div>
  );
};

export default ScrollIndicator;
