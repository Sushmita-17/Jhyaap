import { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

interface ReviewSectionProps {
  productId: string;
  productName: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { getReviewsForProduct, addReview } = useCustomerStore();
  const { user } = useAuthStore();
  const { setPage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const reviews = getReviewsForProduct(productId);
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    addReview({
      productId,
      userId: user.id,
      rating,
      comment,
      userName: user.name,
      verified: true,
    });

    setRating(5);
    setComment('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div>
        <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Customer reviews</p>
        <h3 className="mt-1 text-base md:text-lg font-bold text-white">Product ratings</h3>
      </div>

      <div className="bg-[#16110F] border border-white/5 p-3 md:p-4">
        <div className="flex items-end gap-2 md:gap-3">
          <span className="text-3xl md:text-4xl font-bold text-white">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
          <div className="mb-1 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 md:h-4 md:w-4 ${
                  i < Math.round(avgRating) ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#333333]'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs md:text-sm text-[#888888]">
          {reviews.length > 0 ? `${reviews.length} verified customer review${reviews.length === 1 ? '' : 's'}` : 'No reviews yet'}
        </p>
      </div>

      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#16110F] border border-white/5 text-white px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#1A1A1A] transition-all"
        >
          <Plus className="h-3 w-3 md:h-4 md:w-4" />
          Write a Review
        </button>
      )}

      {!user && (
        <button onClick={() => setPage('login')} className="w-full bg-[#16110F] border border-white/5 text-white px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#1A1A1A] transition-all">
          Sign in to leave a review
        </button>
      )}

      {showForm && user && (
        <form onSubmit={handleSubmit} className="bg-[#16110F] border border-white/5 space-y-3 md:space-y-4 p-3 md:p-4">
          <div>
            <p className="mb-2 text-xs md:text-sm font-semibold text-white">Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                  <Star
                    className={`h-5 w-5 md:h-6 md:w-6 ${
                      star <= rating ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#333333]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs md:text-sm font-semibold text-white">Your review</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your honest feedback..."
              className="w-full h-20 md:h-24 bg-[#0D0908] border border-white/5 rounded-lg px-3 py-2 text-xs md:text-sm text-white placeholder-[#555555] resize-none focus:outline-none focus:border-[#C9A84C]"
              required
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[#C9A84C] text-black px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-white transition-all">
              Post Review
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-[#16110F] border border-white/5 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#1A1A1A] transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 md:space-y-3">
        {reviews.length === 0 ? (
          <p className="py-3 md:py-4 text-center text-xs md:text-sm text-[#888888]">Be the first to review this product.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-white/5 bg-[#0D0908] p-3 md:p-4">
              <div className="mb-2 flex items-start justify-between gap-2 md:gap-3">
                <div>
                  <p className="text-xs md:text-sm font-semibold text-white">{review.userName}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-2.5 w-2.5 md:h-3 md:w-3 ${
                          i < review.rating ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#333333]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.verified && (
                  <span className="rounded-full bg-green-500/10 px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-green-400">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm leading-5 md:leading-6 text-[#DDDDDD]">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
