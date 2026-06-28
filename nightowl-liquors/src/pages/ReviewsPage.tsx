import { useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { reviewStats, storeTestimonials } from '@/data/reviews';
import { useCatalogStore } from '@/store/catalogStore';
import { useAppStore } from '@/store/appStore';
import { useCustomerStore } from '@/store/customerStore';
import PageBackButton from '@/components/PageBackButton';

const ratingFilters = ['All', '5', '4'] as const;

export default function ReviewsPage() {
  const { setPage } = useAppStore();
  const products = useCatalogStore((s) => s.products);
  const customerReviews = useCustomerStore((s) => s.reviews);
  const [filter, setFilter] = useState<(typeof ratingFilters)[number]>('All');

  const productReviews = useMemo(() => {
    return customerReviews.map((review) => {
      const product = products.find((p) => p.id === review.productId);
      return {
        ...review,
        productName: product?.name ?? 'Product',
        productImage: product?.image,
      };
    });
  }, [customerReviews, products]);

  const filteredTestimonials = storeTestimonials.filter((item) => {
    if (filter === 'All') return true;
    return item.rating === Number(filter);
  });

  return (
    <div className="min-h-screen bg-night-950 pb-16 text-night-100">
      <div className="border-b border-night-700/50 py-14 sm:py-16">
        <div className="mx-auto max-w-2xl px-4">
          <PageBackButton to="home" label="Back to home" className="mb-4" />
          <h1 className="font-display text-4xl font-bold text-white">Reviews</h1>
          <p className="mt-4 text-lg leading-8 text-night-400">
            Feedback from people who’ve ordered from us — not a marketing deck. Average so far:{' '}
            <span className="text-night-200">{reviewStats.averageRating}/5</span> across{' '}
            {reviewStats.totalReviews} written reviews.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-night-500">Filter by rating</p>
          <div className="flex gap-2">
            {ratingFilters.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === option
                    ? 'bg-night-700 text-white'
                    : 'text-night-400 hover:text-night-200'
                }`}
              >
                {option === 'All' ? 'All' : `${option} stars`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTestimonials.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-night-600/30 bg-night-900/30 p-5"
            >
              <p className="text-sm leading-7 text-night-200">&ldquo;{review.text}&rdquo;</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-night-700/40 pt-4 text-xs text-night-500">
                <span>
                  <span className="font-medium text-night-300">{review.name}</span> · {review.area}
                </span>
                <span>{review.rating}/5 · {review.highlight}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {productReviews.length > 0 && (
        <section className="border-t border-night-700/40 py-10">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-lg font-semibold text-white">Reviews on specific bottles</h2>
            <p className="mt-1 text-sm text-night-500">Left by customers after purchase</p>
            <div className="mt-6 space-y-4">
              {productReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-night-600/30 bg-night-950/40 p-4"
                >
                  <div className="flex gap-4">
                    {review.productImage && (
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{review.productName}</p>
                      <p className="mt-2 text-sm leading-6 text-night-300">{review.comment}</p>
                      <p className="mt-2 text-xs text-night-500">
                        {review.userName} · {review.rating}/5
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 pb-8">
        <div className="rounded-xl border border-night-600/30 p-6 text-center">
          <p className="text-sm text-night-400">Ordered from us? Leave a review on the product page after delivery.</p>
          <button onClick={() => setPage('products')} className="btn-primary mt-4 inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Browse products
          </button>
        </div>
      </section>
    </div>
  );
}
