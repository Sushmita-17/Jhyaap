import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function SocialSharing({ productName, productPrice }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const shareText = `Check out ${productName} at Jhyaap Station — Rs ${productPrice.toLocaleString()}`;

  const handleShare = (platform) => {
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
      <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Share</p>
      <h3 className="mt-0.5 md:mt-1 mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2 text-base md:text-lg font-bold text-white">
        <Share2 className="h-4 w-4 md:h-5 md:w-5 text-[#C9A84C]" />
        Tell a friend
      </h3>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <button
          onClick={() => handleShare('whatsapp')}
          className="panel-muted flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 transition-colors hover:border-green-500/30"
        >
          <span className="text-lg md:text-xl">💬</span>
          <span className="text-[9px] md:text-xs font-medium text-[#DDDDDD]">WhatsApp</span>
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="panel-muted flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 transition-colors hover:border-blue-500/30"
        >
          <span className="text-lg md:text-xl font-bold text-blue-400">f</span>
          <span className="text-[9px] md:text-xs font-medium text-[#DDDDDD]">Facebook</span>
        </button>
        <button
          onClick={() => handleShare('copy')}
          className="panel-muted flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 transition-colors hover:border-[#C9A84C]/30"
        >
          {copied ? <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400" /> : <Copy className="h-4 w-4 md:h-5 md:w-5 text-[#888888]" />}
          <span className="text-[9px] md:text-xs font-medium text-[#DDDDDD]">{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}

