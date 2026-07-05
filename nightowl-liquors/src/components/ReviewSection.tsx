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
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Customer reviews</p>
        <h3 className="mt-1 text-lg font-bold text-white">Product ratings</h3>
      </div>

      <div className="panel-muted p-4">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-white">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
          <div className="mb-1 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(avgRating) ? 'fill-neon-amber text-neon-amber' : 'text-night-600'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="mt-2 text-sm text-night-400">
          {reviews.length > 0 ? `${reviews.length} verified customer review${reviews.length === 1 ? '' : 's'}` : 'No reviews yet'}
        </p>
      </div>

      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-secondary flex w-full items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Write a Review
        </button>
      )}

      {!user && (
        <button onClick={() => setPage('login')} className="btn-secondary w-full text-sm">
          Sign in to leave a review
        </button>
      )}

      {showForm && user && (
        <form onSubmit={handleSubmit} className="panel-muted space-y-4 p-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-white">Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating ? 'fill-neon-amber text-neon-amber' : 'text-night-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-white">Your review</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your honest feedback..."
              className="input-field h-24 w-full resize-none"
              required
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              Post Review
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="py-4 text-center text-sm text-night-500">Be the first to review this product.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-night-600/30 bg-night-950/40 p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{review.userName}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? 'fill-neon-amber text-neon-amber' : 'text-night-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.verified && (
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-400">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm leading-6 text-night-300">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
