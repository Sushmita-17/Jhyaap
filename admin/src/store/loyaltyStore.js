import { create } from 'zustand';
// Type imports removed - these are JSDoc type definitions only, not actual exports

const STORAGE_KEY = 'jhyaap_loyalty';

export const POINTS_PER_100_RS = 1;
export const POINTS_TO_RUPEE = 10; // 10 points = Rs 1
export const MIN_REDEEM_POINTS = 100;
export const MAX_REDEEM_ORDER_PERCENT = 0.3;

function loadAccounts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function ensureAccount(accounts, userId) {
  if (!accounts[userId]) {
    accounts[userId] = { points: 0, transactions: [] };
  }
  return accounts[userId];
}

const generateTxId = () => `LP_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const useLoyaltyStore = create((set, get) => ({
  accounts: loadAccounts(),

  getPoints: (userId) => get().accounts[userId]?.points ?? 0,

  getTransactions: (userId) => get().accounts[userId]?.transactions ?? [],

  calculateEarnPoints: (orderTotal) => Math.floor(orderTotal / 100) * POINTS_PER_100_RS,

  pointsToRupees: (points) => Math.floor(points / POINTS_TO_RUPEE),

  rupeesToPoints: (rupees) => rupees * POINTS_TO_RUPEE,

  maxRedeemablePoints: (userId, subtotal) => {
    const balance = get().getPoints(userId);
    const maxByOrder = Math.floor((subtotal * MAX_REDEEM_ORDER_PERCENT) * POINTS_TO_RUPEE);
    return Math.max(0, Math.min(balance, maxByOrder));
  },

  earnPoints: (userId, points, orderId, description) => {
    if (points <= 0) return;
    set((state) => {
      const accounts = { ...state.accounts };
      const account = ensureAccount(accounts, userId);
      account.points += points;
      account.transactions = [
        {
          id: generateTxId(),
          type: 'earn',
          points,
          orderId,
          description,
          createdAt: new Date().toISOString(),
        },
        ...account.transactions,
      ].slice(0, 50);
      saveAccounts(accounts);
      return { accounts };
    });
  },

  redeemPoints: (userId, points, orderId) => {
    if (points < MIN_REDEEM_POINTS) return false;
    const balance = get().getPoints(userId);
    if (points > balance) return false;

    set((state) => {
      const accounts = { ...state.accounts };
      const account = ensureAccount(accounts, userId);
      account.points -= points;
      account.transactions = [
        {
          id: generateTxId(),
          type: 'redeem',
          points,
          orderId,
          description: `Redeemed on order ${orderId}`,
          createdAt: new Date().toISOString(),
        },
        ...account.transactions,
      ].slice(0, 50);
      saveAccounts(accounts);
      return { accounts };
    });
    return true;
  },

  refundPoints: (userId, points, orderId) => {
    if (points <= 0) return;
    set((state) => {
      const accounts = { ...state.accounts };
      const account = ensureAccount(accounts, userId);
      account.points += points;
      account.transactions = [
        {
          id: generateTxId(),
          type: 'earn',
          points,
          orderId,
          description: `Refund from cancelled order ${orderId}`,
          createdAt: new Date().toISOString(),
        },
        ...account.transactions,
      ].slice(0, 50);
      saveAccounts(accounts);
      return { accounts };
    });
  },
}));

