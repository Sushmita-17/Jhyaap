// Type definitions converted to JSDoc comments for JavaScript
// These are documentation only - JavaScript doesn't enforce types

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} brand
 * @property {string} category
 * @property {string} subcategory
 * @property {number} price
 * @property {number} [originalPrice]
 * @property {string} volume
 * @property {string} abv
 * @property {string} image
 * @property {number} rating
 * @property {number} reviews
 * @property {boolean} inStock
 * @property {string} [badge]
 * @property {string} description
 * @property {string[]} tags
 */

/**
 * @typedef {Object} CartItem
 * @property {Product} product
 * @property {number} quantity
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {number} count
 * @property {string} color
 * @property {string} image
 */

/**
 * @typedef {Object} BannerSlide
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {string} image
 * @property {string} cta
 * @property {string} link
 * @property {string} [tag]
 */

// Page type - just a string constant for documentation
export const Page = {
  HOME: 'home',
  PRODUCTS: 'products',
  PRODUCT: 'product',
  CART: 'cart',
  CHECKOUT: 'checkout',
  ORDERS: 'orders',
  ORDER_TRACKING: 'order-tracking',
  PROFILE: 'profile',
  SEARCH: 'search',
  CATEGORIES: 'categories',
  LOGIN: 'login',
  ABOUT: 'about',
  FAQS: 'faqs',
  CONTACT: 'contact',
  REVIEWS: 'reviews'
};

/**
 * @typedef {Object} Address
 * @property {string} id
 * @property {string} label
 * @property {string} area
 * @property {string} street
 * @property {string} [landmark]
 * @property {boolean} isDefault
 * @property {number} deliveryFee
 * @property {number} [lat]
 * @property {number} [lng]
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} phone
 * @property {string} email
 * @property {string} name
 * @property {string} [dob]
 * @property {string} [password] - NOTE: plaintext for local-only prototyping. Replace with backend auth + hashing before production.
 * @property {'phone'|'google'} [authMethod]
 * @property {string} [profilePhoto]
 * @property {string} [googleId]
 * @property {boolean} [phoneVerified]
 * @property {number} walletBalance
 * @property {number} [loyaltyPoints]
 */

/**
 * @typedef {Object} DeliveryRider
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} vehicle
 * @property {string} plateNumber
 * @property {number} lat
 * @property {number} lng
 * @property {number} heading
 * @property {number} speed
 * @property {'idle'|'picking'|'driving'|'arrived'} status
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} GeoCoords
 * @property {number} lat
 * @property {number} lng
 * @property {string} [label]
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {CartItem[]} items
 * @property {number} subtotal
 * @property {number} discount
 * @property {number} deliveryFee
 * @property {number} total
 * @property {'placed'|'confirmed'|'preparing'|'out_for_delivery'|'delivered'|'cancelled'} status
 * @property {Address} address
 * @property {'cod'|'esewa'|'khalti'} paymentMethod
 * @property {string} [notes]
 * @property {string} createdAt
 * @property {string} [statusUpdatedAt]
 * @property {string} [eta]
 * @property {string} [deliveryStaffName]
 * @property {string} [deliveryStaffPhone]
 * @property {DeliveryRider} [deliveryRider]
 * @property {GeoCoords} [storeCoords]
 * @property {GeoCoords} [destinationCoords]
 * @property {number} [routeProgress]
 * @property {number} [pointsEarned]
 * @property {number} [pointsRedeemed]
 * @property {string} [userId]
 */

/**
 * @typedef {Object} LoyaltyTransaction
 * @property {string} id
 * @property {'earn'|'redeem'} type
 * @property {number} points
 * @property {string} [orderId]
 * @property {string} description
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Coupon
 * @property {string} id
 * @property {string} code
 * @property {'percentage'|'flat'|'free_delivery'} type
 * @property {number} value
 * @property {number} minOrder
 * @property {number} maxUses
 * @property {number} usesCount
 * @property {string} expiresAt
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} productId
 * @property {string} userId
 * @property {number} rating
 * @property {string} comment
 * @property {string[]} [photos]
 * @property {boolean} verified
 * @property {string} createdAt
 * @property {string} userName
 */

/**
 * @typedef {Object} OrderStatus
 * @property {'placed'|'confirmed'|'preparing'|'out_for_delivery'|'delivered'|'cancelled'} stage
 * @property {string} label
 * @property {string} [time]
 * @property {string} [description]
 */
