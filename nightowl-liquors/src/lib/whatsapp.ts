/** Confirmed business WhatsApp number: +977 9801001101 */
export const WHATSAPP_PHONE = '9779801001101';

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export const whatsappMessages = {
  orderIntent: "Hi, I'd like to place an order",
  support: "Hi, I need help with Jhyaap Station",
  productInquiry: (name: string, price: number) =>
    `Hi, I'm interested in ${name} (Rs. ${price.toLocaleString()})`,
  orderQuestion: (orderId: string) => `Hi, I have a question about order #${orderId}`,
};

export const whatsappLinks = {
  order: () => whatsappUrl(whatsappMessages.orderIntent),
  support: () => whatsappUrl(whatsappMessages.support),
  product: (name: string, price: number) => whatsappUrl(whatsappMessages.productInquiry(name, price)),
  orderById: (orderId: string) => whatsappUrl(whatsappMessages.orderQuestion(orderId)),
};
