
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface SocialShareProps {
  pollId: string;
  pollTitle: string;
}

const SocialShare = ({ pollId, pollTitle }: SocialShareProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const captureScreenshot = async () => {
    try {
      const pollElement = document.querySelector('[data-poll-card]') as HTMLElement;
      if (!pollElement) return null;
      
      const canvas = await html2canvas(pollElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    }
  };

  const shareOnFacebook = async () => {
    setIsSharing(true);
    const screenshot = await captureScreenshot();
    const pollUrl = `${window.location.origin}/?poll=${pollId}`;
    
    // For Facebook, we'll just share the URL for now
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsSharing(false);
  };

  const shareOnTwitter = async () => {
    setIsSharing(true);
    const screenshot = await captureScreenshot();
    const pollUrl = `${window.location.origin}/?poll=${pollId}`;
    const text = `Check out this poll: ${pollTitle}`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pollUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsSharing(false);
  };

  const copyLink = () => {
    const pollUrl = `${window.location.origin}/?poll=${pollId}`;
    navigator.clipboard.writeText(pollUrl);
    toast({
      title: "Link copied!",
      description: "Poll link has been copied to clipboard.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          onClick={shareOnFacebook}
          disabled={isSharing}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:bg-blue-50"
        >
          <Facebook className="w-4 h-4" />
        </Button>
        <Button
          onClick={shareOnTwitter}
          disabled={isSharing}
          variant="ghost"
          size="sm"
          className="text-blue-400 hover:bg-blue-50"
        >
          <Twitter className="w-4 h-4" />
        </Button>
        <Button
          onClick={copyLink}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:bg-gray-50"
        >
          <Link className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SocialShare;
