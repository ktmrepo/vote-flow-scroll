
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
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
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

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
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
      </div>

      {/* Mobile navigation */}
      <div className="block md:hidden">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
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

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
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
