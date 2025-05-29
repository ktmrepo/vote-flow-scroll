import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PollNavigationProps {
  currentIndex: number;
  totalPolls: number;
  onPrevious: () => void;
  onNext: () => void;
}

const PollNavigation = ({ currentIndex, totalPolls, onPrevious, onNext }: PollNavigationProps) => {
  return (
    <>
      {/* Left Arrow - positioned beside poll box */}
      <div className="fixed left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-full z-20" style={{ marginLeft: '-25rem' }}>
        <Button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg disabled:opacity-50 hover:bg-white transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Right Arrow - positioned beside poll box */}
      <div className="fixed left-1/2 top-1/2 transform -translate-y-1/2 translate-x-full z-20" style={{ marginLeft: '25rem' }}>
        <Button
          onClick={onNext}
          disabled={currentIndex === totalPolls - 1}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg disabled:opacity-50 hover:bg-white transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile navigation - keep at screen edges for mobile */}
      <div className="block md:hidden">
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20">
          <Button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg disabled:opacity-50 hover:bg-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20">
          <Button
            onClick={onNext}
            disabled={currentIndex === totalPolls - 1}
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg disabled:opacity-50 hover:bg-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default PollNavigation;
