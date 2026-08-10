import { useMemo, useState } from 'react';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { reviewStats, storeTestimonials } from '@/data/reviews';
import { useCatalogStore } from '@/store/catalogStore';
import { useAppStore } from '@/store/appStore';
import { useCustomerStore } from '@/store/customerStore';
import PageBackButton from '@/components/PageBackButton';

const ratingFilters = ['All', '5', '4'];

export default function ReviewsPage() {
  const { setPage } = useAppStore();
  const products = useCatalogStore((s) => s.products);
  const customerReviews = useCustomerStore((s) => s.reviews);
  const [filter, setFilter] = useState('All');
  const [expandedReview, setExpandedReview] = useState(null);

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
    <div className="min-h-screen bg-[#0D0908] pb-10 md:pb-16 text-[#F5ECD7]">
      <div className="border-b border-white/5 py-4 md:py-14 sm:py-16">
        <div className="mx-auto max-w-2xl px-3 md:px-4">
          <PageBackButton to="home" label="Back to Jhyaap Station" className="mb-2" />
          <h1 className="font-display text-xl md:text-4xl font-bold text-white">Reviews</h1>
          <p className="mt-1 md:mt-4 text-xs md:text-lg leading-5 md:leading-8 text-[#888888]">
            Feedback from people who've ordered from us — not a marketing deck. Average so far:{' '}
            <span className="text-[#C9A84C]">{reviewStats.averageRating}/5</span> across{' '}
            {reviewStats.totalReviews} written reviews.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-3 md:px-4 py-4 md:py-10">
        <div className="mb-3 md:mb-6 flex flex-wrap items-center justify-between gap-2 md:gap-3">
          <p className="text-[10px] md:text-sm text-[#888888]">Filter by rating</p>
          <div className="flex gap-1 md:gap-2">
            {ratingFilters.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-md px-1.5 md:px-3 py-0.5 md:py-1.5 text-[9px] md:text-xs font-medium transition-colors ${
                  filter === option
                    ? 'bg-[#C9A84C] text-black'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                {option === 'All' ? 'All' : `${option} stars`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 md:space-y-4">
          {filteredTestimonials.map((review) => {
            const isExpanded = expandedReview === review.id;
            return (
              <article
                key={review.id}
                className="rounded-xl border border-white/5 bg-[#16110F] p-2.5 md:p-5"
              >
                <button
                  onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                  className="hidden md:flex w-full items-center justify-between mb-4 group"
                >
                  <span className="text-sm font-medium text-white group-hover:text-[#C9A84C] transition-colors">
                    {review.name} &middot; {review.area}
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#C9A84C]/30 bg-[#1A1A1A] text-[#C9A84C] transition-all hover:bg-[#C9A84C] hover:text-black">
                    {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>
                <p className={`text-[10px] md:text-sm leading-4 md:leading-7 text-[#DDDDDD] ${!isExpanded && expandedReview !== null ? 'line-clamp-2 md:line-clamp-2' : ''}`}>
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-2 md:mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2 md:pt-4 text-[9px] md:text-xs text-[#888888]">
                  <span className="md:hidden">
                    <span className="font-medium text-[#F5ECD7]">{review.name}</span> &middot; {review.area}
                  </span>
                  <span>{review.rating}/5 &middot; {review.highlight}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {productReviews.length > 0 && (
        <section className="border-t border-white/5 py-4 md:py-10">
          <div className="mx-auto max-w-3xl px-3 md:px-4">
            <h2 className="text-sm md:text-lg font-semibold text-white">Reviews on specific bottles</h2>
            <p className="mt-1 text-[10px] md:text-sm text-[#888888]">Left by customers after purchase</p>
            <div className="mt-3 md:mt-6 space-y-2 md:space-y-4">
              {productReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-white/5 bg-[#0D0908] p-2.5 md:p-4"
                >
                  <div className="flex gap-2 md:gap-4">
                    {review.productImage && (
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="h-8 w-8 md:h-14 md:w-14 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] md:text-sm font-medium text-white">{review.productName}</p>
                      <p className="mt-0.5 md:mt-2 text-[10px] md:text-sm leading-4 md:leading-6 text-[#DDDDDD]">{review.comment}</p>
                      <p className="mt-0.5 md:mt-2 text-[9px] md:text-xs text-[#888888]">
                        {review.userName} &middot; {review.rating}/5
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-3 md:px-4 pb-5 md:pb-8">
        <div className="rounded-xl border border-white/5 bg-[#16110F] p-3 md:p-6 text-center">
          <p className="text-[10px] md:text-sm text-[#888888]">Ordered from us? Leave a review on the product page after delivery.</p>
          <button onClick={() => setPage('products')} className="mt-2 md:mt-4 inline-flex items-center gap-2 bg-[#C9A84C] text-black px-3 md:px-6 py-1.5 md:py-3 rounded-lg font-bold text-[10px] md:text-sm uppercase tracking-wider hover:bg-white transition-all">
            <ShoppingBag className="h-2.5 w-2.5 md:h-4 md:w-4" />
            Browse products
          </button>
        </div>
      </section>
    </div>
  );
}
