export interface StoreTestimonial {
  id: string;
  name: string;
  area: string;
  rating: number;
  text: string;
  date: string;
  highlight: 'Delivery' | 'Selection' | 'Checkout' | 'Support';
}

export const storeTestimonials: StoreTestimonial[] = [
  {
    id: 't1',
    name: 'Aayush',
    area: 'Lazimpat',
    rating: 5,
    text: 'Ordered around 11pm before friends showed up. Got a call confirming the time, and the guy actually came when he said he would. Old Monk + Coke — nothing fancy, but exactly what I needed.',
    date: '2026-05-12',
    highlight: 'Delivery',
  },
  {
    id: 't2',
    name: 'Prakriti',
    area: 'Jhamsikhel',
    rating: 5,
    text: 'I usually end up calling two shops and still not getting the right bottle size. Here I could see 750ml vs 1L before paying. Small thing, but it saved an argument at home.',
    date: '2026-05-08',
    highlight: 'Selection',
  },
  {
    id: 't3',
    name: 'Rabin',
    area: 'Boudha',
    rating: 4,
    text: 'Delivery was about 45 minutes for us — not instant, but they texted when the rider left. Beer was cold. Would order again for a house party.',
    date: '2026-04-29',
    highlight: 'Delivery',
  },
  {
    id: 't4',
    name: 'Sneha',
    area: 'Thamel',
    rating: 5,
    text: 'Had a work dinner and needed wine + gin last minute. One cart, one payment, done. Didn’t have to explain the order three times on the phone.',
    date: '2026-04-18',
    highlight: 'Checkout',
  },
  {
    id: 't5',
    name: 'Kiran',
    area: 'Bhaktapur',
    rating: 5,
    text: 'Messaged on WhatsApp because I wasn’t sure if Khalti worked for my area. Someone replied in a few minutes — felt like talking to the shop, not a bot.',
    date: '2026-04-02',
    highlight: 'Support',
  },
  {
    id: 't6',
    name: 'Anisha',
    area: 'Patan',
    rating: 4,
    text: 'Second order from here. Same bottles as last time, same price on the site. That consistency matters when you’re reordering for family gatherings.',
    date: '2026-03-21',
    highlight: 'Checkout',
  },
];

export const reviewStats = {
  averageRating: 4.7,
  totalReviews: storeTestimonials.length,
};
