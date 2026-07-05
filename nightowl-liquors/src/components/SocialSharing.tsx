import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface SocialSharingProps {
  productName: string;
  productPrice: number;
  productImage: string;
}

export default function SocialSharing({ productName, productPrice }: SocialSharingProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const shareText = `Check out ${productName} at Jhyaap Station — Rs ${productPrice.toLocaleString()}`;

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'copy') => {
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Share</p>
      <h3 className="mt-1 mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <Share2 className="h-5 w-5 text-neon-amber" />
        Tell a friend
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleShare('whatsapp')}
          className="panel-muted flex flex-col items-center gap-2 p-4 transition-colors hover:border-green-500/30"
        >
          <span className="text-xl">💬</span>
          <span className="text-xs font-medium text-night-200">WhatsApp</span>
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="panel-muted flex flex-col items-center gap-2 p-4 transition-colors hover:border-blue-500/30"
        >
          <span className="text-xl font-bold text-blue-400">f</span>
          <span className="text-xs font-medium text-night-200">Facebook</span>
        </button>
        <button
          onClick={() => handleShare('copy')}
          className="panel-muted flex flex-col items-center gap-2 p-4 transition-colors hover:border-neon-amber/30"
        >
          {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5 text-night-300" />}
          <span className="text-xs font-medium text-night-200">{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}
