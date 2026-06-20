export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://meeshoapis.onrender.com/api';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = ['UPI', 'CARD'];
